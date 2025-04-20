import { Card, CardContent } from "@/components/ui/card"

interface ScoreboardProps {
  playerName: string
  opponentName: string
  playerScore: number
  opponentScore: number
  playerTimeouts: number
  isPlayerTurn: boolean
  sport: string
}

export function Scoreboard({
  playerName,
  opponentName,
  playerScore,
  opponentScore,
  playerTimeouts,
  isPlayerTurn,
  sport,
}: ScoreboardProps) {
  // Get sport-specific color
  const getSportColor = () => {
    switch (sport) {
      case "basketball":
        return "orange"
      case "soccer":
        return "blue"
      case "football":
        return "green"
      case "baseball":
        return "red"
      default:
        return "orange"
    }
  }

  const sportColor = getSportColor()

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-stretch gap-6">
          {/* Player Side */}
          <div
            className={`flex-1 rounded-xl transition-all duration-300 ${
              isPlayerTurn ? "ring-2" : "ring-1"
            } ring-inset`}
            style={{
              background: isPlayerTurn
                ? `linear-gradient(135deg, var(--${sportColor}-50), var(--${sportColor}-100))`
                : "white",
              borderColor: isPlayerTurn ? `var(--${sportColor}-400)` : "var(--gray-200)",
            }}
          >
            <div className="p-4 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
              <div className="text-lg font-bold mb-1 truncate">{playerName}</div>
              <div
                className="text-4xl font-bold font-mono mb-2"
                style={{ color: `var(--${sportColor}-600)` }}
              >
                {playerScore}
              </div>
              <div className="flex items-center gap-1.5">
                {Array(3)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < playerTimeouts ? "scale-100" : "scale-90 opacity-30"
                      }`}
                      style={{
                        backgroundColor: i < playerTimeouts ? `var(--${sportColor}-500)` : `var(--${sportColor}-200)`,
                      }}
                    ></div>
                  ))}
                <span className="text-xs ml-2 text-gray-500">Timeouts</span>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--${sportColor}-600), var(--${sportColor}-400))`,
              }}
            >
              VS
            </div>
          </div>

          {/* Opponent Side */}
          <div
            className={`flex-1 rounded-xl transition-all duration-300 ${
              !isPlayerTurn ? "ring-2" : "ring-1"
            } ring-inset`}
            style={{
              background: !isPlayerTurn
                ? `linear-gradient(135deg, var(--${sportColor}-50), var(--${sportColor}-100))`
                : "white",
              borderColor: !isPlayerTurn ? `var(--${sportColor}-400)` : "var(--gray-200)",
            }}
          >
            <div className="p-4 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
              <div className="text-lg font-bold mb-1 truncate">{opponentName}</div>
              <div className="text-4xl font-bold font-mono mb-2 text-gray-700">{opponentScore}</div>
              <div className="h-6"></div> {/* Spacer to match player side height */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
