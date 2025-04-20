"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getPointValues } from "@/lib/gameService"

interface DifficultySelectorProps {
  onSelect: (points: number) => void
  sport: string
}

const getSportColor = (sport: string): string => {
  switch (sport) {
    case "basketball":
      return "orange"
    case "soccer":
      return "emerald"
    case "football":
      return "amber"
    case "baseball":
      return "red"
    default:
      return "blue"
  }
}

const getPointDescription = (sport: string, points: number): string => {
  switch (sport) {
    case "football":
      return points === 6 ? "Touchdown" : "Field Goal"
    case "soccer":
      return "Goal"
    case "baseball":
      switch (points) {
        case 1: return "Single"
        case 2: return "Double"
        case 3: return "Triple"
        case 4: return "Home Run"
        default: return "Hit"
      }
    case "basketball":
      return points === 3 ? "3 Pointer" : "2 Pointer"
    default:
      return `${points} Points`
  }
}

export function DifficultySelector({ onSelect, sport }: DifficultySelectorProps) {
  const pointValues = getPointValues(sport)
  const sportColor = getSportColor(sport)

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-lg bg-black/30 border-t-2" 
      style={{ 
        borderImage: `linear-gradient(to right, var(--${sportColor}-500), transparent) 1`,
        animation: "fadeIn 0.5s ease-out"
      }}>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Choose Your Shot
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-6">
        {pointValues.map((points) => (
          <Button
            key={points}
            onClick={() => onSelect(points)}
            className={`w-full h-16 relative overflow-hidden transition-all duration-300 
              transform hover:scale-105 hover:shadow-lg group
              bg-gradient-to-r from-black/50 to-black/30 hover:from-black/60 hover:to-black/40
              border border-${sportColor}-500/30 hover:border-${sportColor}-400/50`}
            style={{
              boxShadow: `0 0 20px rgba(var(--${sportColor}-500-rgb), 0.1)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-45 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <span className="text-xl font-bold text-white relative z-10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {getPointDescription(sport, points)}
            </span>
          </Button>
        ))}
      </CardContent>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Card>
  )
}
