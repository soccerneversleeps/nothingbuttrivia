"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { PageContainer } from "@/components/shared/page-container"
import { ContentCard } from "@/components/shared/content-card"
import { joinGame } from "@/lib/gameService"
import { Toaster } from "react-hot-toast"

export default function JoinGame() {
  const router = useRouter()
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const gameData = await joinGame(gameCode, playerName)
      
      // Save game state to local storage
      localStorage.setItem("gameState", JSON.stringify({
        gameId: gameCode,
        playerName: playerName,
        isHost: false
      }))

      toast.success("Successfully joined game!")
      router.push("/game")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join game")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer title="JOIN GAME" subtitle="Enter the game code shared by your friend">
      <div className="w-full max-w-md mx-auto">
        <ContentCard>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="space-y-3">
              <Label htmlFor="gameCode" className="text-white text-lg">
                Game Code
              </Label>
              <Input
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter 6-character code"
                className="bg-white/10 border-white/20 text-white h-12 text-lg uppercase"
                maxLength={6}
              />
            </div>

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
              type="submit"
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Joining..." : "Join Game"}
            </Button>
          </form>
        </ContentCard>
      </div>
      <Toaster position="top-center" />
    </PageContainer>
  )
} 