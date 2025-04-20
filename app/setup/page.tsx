"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PageContainer } from "@/components/shared/page-container"
import { ContentCard } from "@/components/shared/content-card"
import { createGame } from "@/lib/gameService"
import { generateGameCode } from "@/lib/utils"

export default function GameSetup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mode, setMode] = useState<"single" | "multi" | null>(() => {
    const initialMode = searchParams.get("mode")
    return (initialMode === "single" || initialMode === "multi") ? initialMode : null
  })
  const [sport, setSport] = useState<string | null>(() => {
    const initialSport = searchParams.get("sport")
    return initialSport || null
  })
  const [playerName, setPlayerName] = useState("")
  const [gameCode, setGameCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateGame = async () => {
    if (!playerName.trim() || !sport) {
      toast({
        title: "Missing information",
        description: "Please enter your name and select a sport",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (mode === "multi") {
        // Generate a unique game code
        const newGameCode = generateGameCode()
        setGameCode(newGameCode)

        // Create the game in Firebase
        await createGame(newGameCode, playerName)

        // Save game state to localStorage
        const gameState = {
          mode: "multi",
          sport,
          teamName: playerName,
          gameCode: newGameCode,
          score: 0,
          opponentScore: 0,
          timeoutsRemaining: 3,
        }
        localStorage.setItem("nothingButTriviaGameState", JSON.stringify(gameState))

        // Show success message with game code
        toast({
          title: "Game Created!",
          description: `Share this code with your friend: ${newGameCode}`,
        })
      } else {
        // Single player mode
        const gameState = {
          mode: "single",
          sport,
          teamName: playerName,
          score: 0,
          timeoutsRemaining: 3,
        }
        localStorage.setItem("nothingButTriviaGameState", JSON.stringify(gameState))
        router.push("/game")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to create game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode)
      toast({
        title: "Code Copied!",
        description: "Share this code with your friend to join the game.",
      })
    }
  }

  const handleStartGame = () => {
    router.push("/game")
  }

  return (
    <PageContainer title="GAME SETUP" subtitle="Choose your game mode and settings">
      <div className="w-full max-w-md mx-auto space-y-6">
        {!mode ? (
          <ContentCard>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Select Game Mode</h2>
              <Button
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 mb-3"
                onClick={() => setMode("single")}
              >
                Single Player
              </Button>
              <Button
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500"
                onClick={() => setMode("multi")}
              >
                Challenge a Friend
              </Button>
            </div>
          </ContentCard>
        ) : !gameCode ? (
          <ContentCard>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <Label htmlFor="playerName" className="text-white text-lg">
                  Your Name
                </Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-white/10 border-white/20 text-white h-12 text-lg"
                />
              </div>

              <Button
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500"
                onClick={handleCreateGame}
                disabled={isLoading}
              >
                {isLoading ? "Creating Game..." : "Create Game"}
              </Button>
            </div>
          </ContentCard>
        ) : mode === "multi" ? (
          <ContentCard>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Share Game Code</h2>
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-mono font-bold text-white tracking-wider">
                  {gameCode}
                </p>
              </div>
              <Button
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500"
                onClick={handleCopyCode}
              >
                Copy Code
              </Button>
              <Button
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500"
                onClick={handleStartGame}
              >
                Start Game
              </Button>
            </div>
          </ContentCard>
        ) : null}
      </div>
    </PageContainer>
  )
}
