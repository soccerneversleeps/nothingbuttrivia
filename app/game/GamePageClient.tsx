"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Scoreboard } from "@/components/scoreboard"
import { QuestionCard } from "@/components/question-card"
import { GameSummary } from "@/components/game-summary"
import { DifficultySelector } from "@/components/difficulty-selector"
import { addHighScore, getTopHighScores } from "@/lib/highScoreService"
import { getQuestion } from "@/lib/questionService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface GameState {
  mode: string
  sport: string
  teamName: string
  gameCode: string | null
  score: number
  opponentScore: number
  timeoutsRemaining: number
}

interface Question {
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
  category: string
  difficulty: number
  id: string
}

interface GameQuestion {
  question: string
  answers: string[]
  correctAnswer: string
  explanation: string
  pointValue: number
  category: string
}

interface HighScore {
  code: string
  score: number
  sport: string
  timestamp: Date
}

export default function GamePageClient() {
  const router = useRouter()
  const { toast } = useToast()

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutes for single player
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [isGameOver, setIsGameOver] = useState(false)
  const [selectedPoints, setSelectedPoints] = useState<number>(2)
  const [isSelectingDifficulty, setIsSelectingDifficulty] = useState(true)
  const [timerActive, setTimerActive] = useState(false)
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false)
  const [playerCode, setPlayerCode] = useState("")
  const [highScores, setHighScores] = useState<HighScore[]>([])
  const [timerStarted, setTimerStarted] = useState(false)

  // Load game state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem("nothingButTriviaGameState")
      if (!savedState) {
        router.push("/")
        return
      }

      const state = JSON.parse(savedState)
      setGameState(state)

      // Load high scores for the sport
      if (state.sport) {
        loadHighScores(state.sport)
      }
    }
  }, [router])

  // Load high scores for the current sport
  const loadHighScores = async (sport: string) => {
    const scores = await getTopHighScores(sport)
    setHighScores(scores)
  }

  // Get a question based on points and sport
  const getGameQuestion = useCallback(async (points: number) => {
    if (!gameState) return null
    try {
      const question = await getQuestion(gameState.sport, points)
      console.log('Received question:', question)
      if (question) {
        return {
          question: question.text,
          answers: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          pointValue: points,
          category: gameState.sport,
        }
      }
      return null
    } catch (error) {
      console.error("Error getting question:", error)
      return null
    }
  }, [gameState])

  // Start a new question
  const startNewQuestion = useCallback(async () => {
    setSelectedAnswer(null)
    setIsAnswerRevealed(false)
    const question = await getGameQuestion(selectedPoints)
    console.log('Starting new question:', question)
    if (question) {
      setCurrentQuestion(question)
    } else {
      toast({
        title: "Error",
        description: "Failed to get a new question. Please try again.",
        variant: "destructive",
      })
    }
  }, [getGameQuestion, selectedPoints, toast])

  // Handle points selection
  const handlePointsSelect = async (points: number) => {
    console.log('Selected points:', points)
    setSelectedPoints(points)
    setIsSelectingDifficulty(false)
    await startNewQuestion()
  }

  // Timer effect for single player mode
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameState?.mode === "single" && timerActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && gameState?.mode === "single") {
      // Time's up in single player mode
      setTimerActive(false)
      setIsGameOver(true)
      setShowHighScoreDialog(true)
    }

    return () => clearTimeout(timer)
  }, [timeRemaining, timerActive, gameState?.mode])

  // Handle answer selection
  const handleAnswer = (answer: string | null) => {
    setSelectedAnswer(answer)

    // Check if answer is correct
    const isCorrect = answer === currentQuestion?.correctAnswer

    // Update game state
    setGameState((prev) => {
      if (!prev) return null
      const newState = { ...prev }

      if (isCorrect) {
        newState.score += selectedPoints
      }

      // Save updated state
      if (typeof window !== 'undefined') {
        localStorage.setItem("nothingButTriviaGameState", JSON.stringify(newState))
      }
      return newState
    })

    // Reveal the answer
    setIsAnswerRevealed(true)

    // Wait 1.5 seconds before next question in single player mode
    if (gameState?.mode === "single") {
      setTimeout(() => {
        setIsSelectingDifficulty(true)
      }, 1500)
    }
  }

  // Handle submitting high score
  const handleSubmitHighScore = async () => {
    if (!gameState) return

    const code = playerCode.toUpperCase()
    if (!/^[A-Z]{3}$/.test(code)) {
      toast({
        title: "Invalid Code",
        description: "Please enter exactly 3 uppercase letters",
        variant: "destructive",
      })
      return
    }

    const success = await addHighScore(code, gameState.score, gameState.sport)
    if (success) {
      toast({
        title: "High Score Saved!",
        description: "Your score has been added to the leaderboard.",
      })
      setShowHighScoreDialog(false)
      await loadHighScores(gameState.sport)
    } else {
      toast({
        title: "Error",
        description: "Unable to save high score. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Use a timeout
  const useTimeout = () => {
    if (gameState?.timeoutsRemaining !== undefined && gameState.timeoutsRemaining > 0 && timerActive) {
      setGameState((prev) => {
        if (!prev) return null
        const newState = { ...prev, timeoutsRemaining: prev.timeoutsRemaining - 1 }
        if (typeof window !== 'undefined') {
          localStorage.setItem("nothingButTriviaGameState", JSON.stringify(newState))
        }
        return newState
      })

      // Pause the timer for 10 seconds
      setTimerActive(false)
      toast({
        title: "Timeout Used",
        description: "Timer paused for 10 seconds",
      })

      setTimeout(() => {
        setTimerActive(true)
      }, 10000)
    }
  }

  // AI turn logic
  useEffect(() => {
    if (!isPlayerTurn && !isSelectingDifficulty && !isGameOver) {
      // AI selects difficulty - 40% chance for 3-pointer
      const aiPoints = Math.random() < 0.4 ? 3 : 2
      setSelectedPoints(aiPoints)

      // Get a question for AI
      const aiQuestion = getGameQuestion(aiPoints)
      aiQuestion.then((question) => {
        if (question) {
          setCurrentQuestion(question)
          handleAnswer(question.correctAnswer)
        }
      })
    }
  }, [isPlayerTurn, isSelectingDifficulty, isGameOver, getGameQuestion])

  // Get sport display name and color
  const getSportInfo = () => {
    if (!gameState) return { name: "Sports", color: "orange", bgColor: "from-orange-50 to-orange-100" }

    switch (gameState.sport) {
      case "basketball":
        return { name: "Basketball", color: "orange", bgColor: "from-orange-50 to-orange-100" }
      case "soccer":
        return { name: "Soccer", color: "blue", bgColor: "from-blue-50 to-blue-100" }
      case "football":
        return { name: "Football", color: "green", bgColor: "from-green-50 to-green-100" }
      case "baseball":
        return { name: "Baseball", color: "red", bgColor: "from-red-50 to-red-100" }
      default:
        return { name: "Sports", color: "orange", bgColor: "from-orange-50 to-orange-100" }
    }
  }

  const sportInfo = getSportInfo()

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Add timer start handler
  const handleStartTimer = () => {
    setTimerStarted(true)
    setTimerActive(true)
    setIsSelectingDifficulty(true)
  }

  // If game state is not loaded yet
  if (!gameState) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Game over screen for single player
  if (isGameOver && gameState.mode === "single") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#4169e1] to-[#4834d4] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full blur-md animate-pulse"></div>
            <img
              src={`https://img.icons8.com/ios-filled/96/ffffff/${gameState.sport === 'football' ? 'american-football' : 
                    gameState.sport === 'soccer' ? 'football2--v1' : 
                    gameState.sport === 'baseball' ? 'baseball' : 'basketball'}.png`}
              alt={`${sportInfo.name} Icon`}
              className="h-20 w-20 relative z-10 animate-bounce"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        {/* Background Animation */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M0,30 Q25,35 50,30 T100,30 V100 H0 Z" 
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              className="animate-pulse"
            />
            <path 
              d="M0,35 Q25,40 50,35 T100,35 V100 H0 Z" 
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              className="animate-pulse delay-100"
            />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-lg">
            <div className="text-center">
              <h1 
                className="text-6xl font-extrabold mb-6 tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
                  TIME'S UP!
                </span>
              </h1>

              <div className="text-2xl font-bold mb-12 tracking-wide" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                Final Score: {gameState.score}
              </div>

              {/* High Scores Table */}
              <div className="mb-12">
                <h3 
                  className="text-3xl font-bold mb-6 tracking-wide bg-gradient-to-r from-white via-blue-200 to-white inline-block"
                  style={{ fontFamily: "'Orbitron', sans-serif", WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  HIGH SCORES
                </h3>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  {highScores.map((score, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center py-4 px-6 rounded-xl mb-3 bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                    >
                      <span className="font-mono text-2xl text-white/90">{score.code}</span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-white via-blue-200 to-white inline-block"
                            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const resetState = {
                      ...gameState,
                      score: 0,
                      timeoutsRemaining: 3,
                    }
                    if (typeof window !== 'undefined') {
                      localStorage.setItem("nothingButTriviaGameState", JSON.stringify(resetState))
                    }
                    setGameState(resetState)
                    setIsGameOver(false)
                    setTimeRemaining(180)
                    setIsSelectingDifficulty(true)
                  }}
                  className="flex-1 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg
                           border border-white/20 hover:bg-white/20 transition-all duration-300
                           shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem("nothingButTriviaGameState")
                    }
                    router.push("/")
                  }}
                  className="flex-1 bg-white/5 backdrop-blur-md text-white/90 px-8 py-4 rounded-2xl font-bold text-lg
                           border border-white/10 hover:bg-white/10 transition-all duration-300"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  EXIT TO MENU
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* High Score Dialog */}
        <Dialog open={showHighScoreDialog} onOpenChange={setShowHighScoreDialog}>
          <DialogContent className="bg-[#4169e1]/20 backdrop-blur-md border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-2xl">
            <DialogHeader>
              <DialogTitle 
                className="text-4xl text-center tracking-wider bg-gradient-to-r from-white via-blue-200 to-white inline-block"
                style={{ fontFamily: "'Orbitron', sans-serif", WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                ENTER YOUR CODE
              </DialogTitle>
              <DialogDescription 
                className="text-white/80 text-center text-lg mt-2"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                Enter a 3-letter code to save your high score
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <Input
                value={playerCode}
                onChange={(e) => setPlayerCode(e.target.value.toUpperCase())}
                placeholder="ABC"
                maxLength={3}
                className="text-center text-4xl font-mono bg-white/10 border-white/20 text-white placeholder:text-white/40
                         h-20 rounded-xl tracking-widest focus:ring-2 focus:ring-white/30 focus:border-white/30"
              />
              <button
                onClick={handleSubmitHighScore}
                className="w-full bg-white/10 backdrop-blur-md text-white px-8 py-5 rounded-xl font-bold text-xl
                         border border-white/20 hover:bg-white/20 transition-all duration-300
                         shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!playerCode || playerCode.length !== 3}
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                SUBMIT SCORE
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4169e1] to-[#4834d4] text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-8">
        <div className="relative">
          <div className="absolute inset-0 bg-white rounded-full blur-md animate-pulse"></div>
          <img
            src={`https://img.icons8.com/ios-filled/96/ffffff/${gameState.sport === 'football' ? 'american-football' : 
                  gameState.sport === 'soccer' ? 'football2--v1' : 
                  gameState.sport === 'baseball' ? 'baseball' : 'basketball'}.png`}
            alt={`${sportInfo.name} Icon`}
            className="h-20 w-20 relative z-10 animate-bounce"
            style={{ animationDuration: "2s" }}
          />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path 
            d="M0,30 Q25,35 50,30 T100,30 V100 H0 Z" 
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            className="animate-pulse"
          />
          <path 
            d="M0,35 Q25,40 50,35 T100,35 V100 H0 Z" 
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            className="animate-pulse delay-100"
          />
        </svg>
      </div>

      <div className="relative z-10">
        <header className="container mx-auto py-4 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-wider" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                {sportInfo.name} TRIVIA
              </h1>
            </div>
            {timerStarted && (
              <div className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-xl shadow-lg border border-white/20">
                <span className="text-2xl sm:text-4xl font-mono font-bold text-white">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Score Display */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl mt-4 p-4 sm:p-6 shadow-lg border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold text-lg sm:text-xl mb-1" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  {gameState.teamName}
                </h2>
                <p className="text-3xl sm:text-5xl font-bold text-white">
                  {gameState.score}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium mb-1 text-sm sm:text-base">TIMEOUTS</p>
                <div className="flex gap-2 sm:gap-3">
                  {[...Array(gameState.timeoutsRemaining)].map((_, i) => (
                    <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  ))}
                  {[...Array(3 - gameState.timeoutsRemaining)].map((_, i) => (
                    <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/20" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4">
          {!timerStarted ? (
            <div className="w-full max-w-md mx-auto mt-4 bg-black/30 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 text-center">
              <h2 className="text-3xl font-bold mb-4 text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                3-MINUTE CHALLENGE
              </h2>
              <p className="text-white text-lg mb-8">
                You have 3 minutes to score as many points as possible. Use your timeouts wisely to pause the timer!
              </p>
              <button
                onClick={handleStartTimer}
                className="bg-blue-600/80 backdrop-blur-md text-white px-10 py-4 rounded-2xl font-bold text-xl 
                         border border-blue-400/40 hover:bg-blue-500/80 transition-all duration-300
                         shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
              >
                START TIMER
              </button>
            </div>
          ) : isSelectingDifficulty ? (
            <div className="w-full max-w-md mx-auto mt-4">
              <DifficultySelector onSelect={handlePointsSelect} sport={gameState.sport} />
            </div>
          ) : currentQuestion ? (
            <div className="w-full max-w-2xl mx-auto mt-4">
              <QuestionCard
                question={currentQuestion}
                timeRemaining={24}
                selectedAnswer={selectedAnswer}
                isAnswerRevealed={isAnswerRevealed}
                isPlayerTurn={true}
                onAnswerSelect={handleAnswer}
                onUseTimeout={useTimeout}
                timeoutsRemaining={gameState.timeoutsRemaining}
                sport={gameState.sport}
              />
            </div>
          ) : null}
        </main>

        <footer className="container mx-auto py-6 text-center">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Nothing But Trivia
          </p>
        </footer>

        {/* Game Over Screen */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isGameOver ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-500`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl">
            <div className="bg-gradient-to-b from-[#4169e1]/30 to-[#4834d4]/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-[0_0_50px_rgba(65,105,225,0.2)]">
              <h2 
                className="text-6xl font-bold text-center mb-6 tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                TIME'S UP!
              </h2>
              <div className="text-center mb-8">
                <p className="text-white/80 text-xl mb-2" style={{ fontFamily: "'Exo 2', sans-serif" }}>Final Score</p>
                <p className="text-7xl font-bold text-white mb-4" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  {gameState.score}
                </p>
                <div className="w-32 h-1 bg-white/20 mx-auto rounded-full mb-4" />
                <p className="text-white/60 text-lg" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  {gameState.teamName}
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md border border-white/10">
                <h3 
                  className="text-2xl font-bold mb-4 text-center tracking-wide"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  HIGH SCORES
                </h3>
                <div className="space-y-3">
                  {highScores.map((score, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10
                               hover:bg-white/10 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono font-bold text-white/60">{index + 1}</span>
                        <span className="text-xl font-bold tracking-wider">{score.code}</span>
                      </div>
                      <span className="text-2xl font-bold">{score.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsGameOver(false)
                    setIsSelectingDifficulty(true)
                  }}
                  className="flex-1 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg
                           border border-white/20 hover:bg-white/20 transition-all duration-300
                           shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                           hover:scale-105 transform"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem("nothingButTriviaGameState")
                    }
                    router.push("/")
                  }}
                  className="flex-1 bg-white/5 backdrop-blur-md text-white/90 px-8 py-4 rounded-2xl font-bold text-lg
                           border border-white/10 hover:bg-white/10 transition-all duration-300
                           hover:scale-105 transform"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  EXIT TO MENU
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* High Score Dialog */}
        <Dialog open={showHighScoreDialog} onOpenChange={setShowHighScoreDialog}>
          <DialogContent className="bg-[#4169e1]/20 backdrop-blur-md border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-2xl">
            <DialogHeader>
              <DialogTitle 
                className="text-4xl text-center tracking-wider bg-gradient-to-r from-white via-blue-200 to-white inline-block"
                style={{ fontFamily: "'Orbitron', sans-serif", WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                ENTER YOUR CODE
              </DialogTitle>
              <DialogDescription 
                className="text-white/80 text-center text-lg mt-2"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                Enter a 3-letter code to save your high score
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <Input
                value={playerCode}
                onChange={(e) => setPlayerCode(e.target.value.toUpperCase())}
                placeholder="ABC"
                maxLength={3}
                className="text-center text-4xl font-mono bg-white/10 border-white/20 text-white placeholder:text-white/40
                         h-20 rounded-xl tracking-widest focus:ring-2 focus:ring-white/30 focus:border-white/30"
              />
              <button
                onClick={handleSubmitHighScore}
                className="w-full bg-white/10 backdrop-blur-md text-white px-8 py-5 rounded-xl font-bold text-xl
                         border border-white/20 hover:bg-white/20 transition-all duration-300
                         shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!playerCode || playerCode.length !== 3}
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                SUBMIT SCORE
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 