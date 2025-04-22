"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Scoreboard } from "@/components/scoreboard"
import { QuestionCard } from "@/components/question-card"
import { GameSummary } from "@/components/game-summary"
import { DifficultySelector } from "@/components/difficulty-selector"
import { addHighScore, getTopHighScores } from "@/lib/highScoreService"
import { getQuestion, preloadQuestionsForGame } from "@/lib/questionService"
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
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
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
  const [nextQuestion, setNextQuestion] = useState<GameQuestion | null>(null)

  // Load game state from localStorage
  useEffect(() => {
    const loadGameState = async () => {
      setIsLoading(true)
      setLoadError(null)

      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      try {
        const savedState = localStorage.getItem("nothingButTriviaGameState")
        if (!savedState) {
          console.log('No saved state found, redirecting to home')
          router.push("/")
          return
        }

        const state = JSON.parse(savedState)
        console.log('Loaded game state:', state)
        setGameState(state)

        // Load high scores for the sport
        if (state.sport) {
          await loadHighScores(state.sport)
        }
      } catch (error) {
        console.error('Error loading game state:', error)
        setLoadError('Failed to load game state. Please try again.')
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadGameState()
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
      console.log('Getting question with points:', points, 'for sport:', gameState.sport)
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
      console.log('No question received')
      return null
    } catch (error) {
      console.error("Error getting question:", error)
      return null
    }
  }, [gameState])

  // Preload next question
  const preloadNextQuestion = useCallback(async () => {
    if (!gameState?.sport) return
    const question = await getGameQuestion(selectedPoints)
    setNextQuestion(question)
  }, [gameState?.sport, getGameQuestion, selectedPoints])

  // Handle answer selection
  const handleAnswer = (answer: string | null) => {
    if (!currentQuestion) return
    
    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion.correctAnswer

    // Update game state
    setGameState((prev) => {
      if (!prev) return null
      const newState = {
        ...prev,
        score: isCorrect ? prev.score + selectedPoints : prev.score
      }
      localStorage.setItem("nothingButTriviaGameState", JSON.stringify(newState))
      return newState
    })

    setIsAnswerRevealed(true)

    // Move to next question after delay
    if (gameState?.mode === "single") {
      setTimeout(() => {
        setSelectedAnswer(null)
        setIsAnswerRevealed(false)
        setIsSelectingDifficulty(true)
        
        // Clear current question to ensure clean state
        setCurrentQuestion(null)
      }, 1500)
    }
  }

  // Handle points selection
  const handlePointsSelect = async (points: number) => {
    try {
      setSelectedPoints(points)
      setIsSelectingDifficulty(false)
      
      // Get new question
      const question = await getGameQuestion(points)
      if (question) {
        setCurrentQuestion(question)
      } else {
        toast({
          title: "Error",
          description: "Failed to load question. Please try again.",
          variant: "destructive",
        })
        setIsSelectingDifficulty(true)
      }
    } catch (error) {
      console.error('Error handling points selection:', error)
      setIsSelectingDifficulty(true)
    }
  }

  // Timer effect for single player mode
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameState?.mode === "single" && timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && gameState?.mode === "single") {
      setTimerActive(false)
      setIsGameOver(true)
      setShowHighScoreDialog(true)
    }

    return () => clearInterval(timer)
  }, [timeRemaining, timerActive, gameState?.mode])

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
  const handleStartTimer = async () => {
    if (!gameState?.sport) return

    // Start preloading questions
    toast({
      title: "Loading Questions",
      description: "Preparing your trivia questions...",
    })

    try {
      // Preload questions in the background
      preloadQuestionsForGame(gameState.sport)
        .catch(error => console.error('Error preloading questions:', error))
      
      // Start the game immediately
      setTimerStarted(true)
      setTimerActive(true)
      setIsSelectingDifficulty(true)
    } catch (error) {
      console.error('Error starting game:', error)
      toast({
        title: "Error",
        description: "Failed to start the game. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Main game content render
  const renderGameContent = () => {
    if (!gameState) return null

    if (!timerStarted) {
      return (
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
      )
    }

    if (isSelectingDifficulty) {
      return (
        <div className="w-full max-w-md mx-auto mt-4">
          <DifficultySelector onSelect={handlePointsSelect} sport={gameState.sport} />
        </div>
      )
    }

    if (currentQuestion) {
      return (
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
      )
    }

    return null
  }

  // Early return for loading and error states
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#4169e1] to-[#4834d4]">
        <Card className="w-full max-w-2xl mx-4 bg-black/30 border-white/10">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-3/4 mx-auto bg-white/10 rounded"></div>
              <div className="h-32 bg-white/10 rounded"></div>
              <div className="h-12 w-1/2 mx-auto bg-white/10 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render error state
  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Card className="w-full max-w-2xl mx-4 bg-black/30 border-white/10">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Error Loading Game</h2>
            <p className="text-white/80 mb-6">{loadError}</p>
            <Button 
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render game not initialized state
  if (!gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Card className="w-full max-w-2xl mx-4 bg-black/30 border-white/10">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-white">Game Not Initialized</h2>
            <p className="text-white/80 mb-6">Please start a new game from the home page.</p>
            <Button 
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Start New Game
            </Button>
          </CardContent>
        </Card>
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
          {renderGameContent()}
        </main>

        <footer className="container mx-auto py-6 text-center">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Nothing But Trivia
          </p>
        </footer>
      </div>
    </div>
  )
}

 