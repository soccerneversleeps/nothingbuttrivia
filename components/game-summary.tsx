"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { markGameForDeletion } from "@/lib/gameService"

interface GameSummaryProps {
  playerScore: number
  opponentScore: number
  playerName: string
  opponentName: string
  sport: string
  gameCode?: string
  isHost?: boolean
  onPlayAgain: () => void
  onExit: () => void
}

export function GameSummary({
  playerScore,
  opponentScore,
  playerName,
  opponentName,
  sport,
  gameCode,
  isHost = false,
  onPlayAgain,
  onExit
}: GameSummaryProps) {
  const handleExit = async () => {
    // If this is a multiplayer game, mark it for deletion
    if (gameCode) {
      await markGameForDeletion(gameCode, isHost ? 'host' : 'guest');
    }
    onExit();
  };

  const handlePlayAgain = async () => {
    // If this is a multiplayer game, mark it for deletion before starting new game
    if (gameCode) {
      await markGameForDeletion(gameCode, isHost ? 'host' : 'guest');
    }
    onPlayAgain();
  };

  const playerWon = playerScore >= 21

  // Get sport-specific color and name
  const getSportInfo = () => {
    switch (sport) {
      case "basketball":
        return { name: "Basketball", color: "orange" }
      case "soccer":
        return { name: "Soccer", color: "blue" }
      case "football":
        return { name: "Football", color: "green" }
      case "baseball":
        return { name: "Baseball", color: "red" }
      default:
        return { name: "Sports", color: "orange" }
    }
  }

  const sportInfo = getSportInfo()

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-${sportInfo.color}-50 to-${sportInfo.color}-100 flex items-center justify-center p-4`}
      style={{
        background: `linear-gradient(to bottom, var(--${sportInfo.color}-50), var(--${sportInfo.color}-100))`,
      }}
    >
      <Card className="w-full max-w-lg bg-white shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <img src={`/${sport}-icon.png`} alt={sportInfo.name} className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl font-bold">{playerWon ? "Victory!" : "Game Over"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">{playerWon ? `${playerName} wins!` : `${opponentName} wins!`}</h2>

            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-lg font-semibold">{playerName}</div>
                <div
                  className={`text-4xl font-bold`}
                  style={{ color: playerWon ? `var(--${sportInfo.color}-600)` : "var(--gray-600)" }}
                >
                  {playerScore}
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">{opponentName}</div>
                <div
                  className={`text-4xl font-bold`}
                  style={{ color: !playerWon ? `var(--${sportInfo.color}-600)` : "var(--gray-600)" }}
                >
                  {opponentScore}
                </div>
              </div>
            </div>

            {playerWon ? (
              <div
                className="p-4 rounded-lg border mb-6"
                style={{
                  backgroundColor: `var(--${sportInfo.color}-50)`,
                  borderColor: `var(--${sportInfo.color}-200)`,
                  color: `var(--${sportInfo.color}-800)`,
                }}
              >
                <p>Congratulations! Your {sportInfo.name.toLowerCase()} knowledge has led you to victory!</p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <p className="text-blue-800">
                  Good effort! Practice your {sportInfo.name.toLowerCase()} trivia and try again!
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handlePlayAgain}
              className="flex-1"
              style={{ backgroundColor: `var(--${sportInfo.color}-500)` }}
            >
              Play Again
            </Button>
            <Button
              onClick={handleExit}
              variant="outline"
              className="flex-1"
              style={{
                borderColor: `var(--${sportInfo.color}-500)`,
                color: `var(--${sportInfo.color}-500)`,
              }}
            >
              Exit to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
