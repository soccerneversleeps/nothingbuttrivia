"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface QuestionCardProps {
  question: any
  timeRemaining: number
  selectedAnswer: string | null
  isAnswerRevealed: boolean
  isPlayerTurn: boolean
  onAnswerSelect: (answer: string) => void
  onUseTimeout: () => void
  timeoutsRemaining: number
  sport: string
}

export function QuestionCard({
  question,
  timeRemaining,
  selectedAnswer,
  isAnswerRevealed,
  isPlayerTurn,
  onAnswerSelect,
  onUseTimeout,
  timeoutsRemaining,
  sport,
}: QuestionCardProps) {
  const [shotClockProgress, setShotClockProgress] = useState(100)

  useEffect(() => {
    setShotClockProgress((timeRemaining / 24) * 100)
  }, [timeRemaining])

  if (!question) return null

  // Determine if time is running low (5 seconds or less)
  const isTimeLow = timeRemaining <= 5

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

  // Get answer button style based on state
  const getAnswerButtonStyle = (answer: string) => {
    if (!isAnswerRevealed) {
      if (selectedAnswer === answer) {
        return `
          bg-gradient-to-r from-blue-600/80 to-blue-500/80 border-blue-400/40 text-white
          hover:from-blue-700/80 hover:to-blue-600/80
          shadow-[0_0_15px_rgba(59,130,246,0.3)]
        `
      }
      return `
        bg-gradient-to-r from-blue-500/60 to-blue-400/60 border-blue-300/30 text-white
        hover:from-blue-600/70 hover:to-blue-500/70
        shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]
      `
    }

    if (answer === question.correctAnswer) {
      return `
        bg-gradient-to-r from-green-600/80 to-green-500/80 border-green-400/40 text-white
        shadow-[0_0_15px_rgba(34,197,94,0.3)]
      `
    }

    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return `
        bg-gradient-to-r from-red-600/80 to-red-500/80 border-red-400/40 text-white
        shadow-[0_0_15px_rgba(239,68,68,0.3)]
      `
    }

    return `
      bg-gradient-to-r from-blue-500/40 to-blue-400/40 border-blue-300/20 text-white/70
      shadow-[0_0_10px_rgba(59,130,246,0.1)]
    `
  }

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/20 shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Shot Clock and Points */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="relative h-8 w-8">
            <svg className="transform -rotate-90 w-8 h-8">
              <circle
                className="text-white/10"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="14"
                cx="16"
                cy="16"
              />
              <circle
                className={`${isTimeLow ? 'text-red-500' : 'text-white'} transition-all duration-300`}
                strokeWidth="4"
                strokeDasharray={87.96}
                strokeDashoffset={87.96 - (shotClockProgress / 100) * 87.96}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="14"
                cx="16"
                cy="16"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {timeRemaining}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Points:</span>
            <span className="text-2xl font-bold text-white">{question.pointValue}</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-4 sm:mb-6">
          <p className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            {question.question}
          </p>
        </div>

        {/* Answers */}
        <div className="space-y-2 sm:space-y-3">
          {question.answers.map((answer: string, index: number) => (
            <button
              key={answer}
              onClick={() => !isAnswerRevealed && onAnswerSelect(answer)}
              disabled={isAnswerRevealed}
              className={`
                w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 relative overflow-hidden
                backdrop-blur-md border font-medium transform hover:scale-[1.02]
                ${getAnswerButtonStyle(answer)}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 text-white font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-base sm:text-lg">{answer}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-45 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </button>
          ))}
        </div>

        {/* Timeout Button */}
        {timeoutsRemaining > 0 && !isAnswerRevealed && (
          <div className="mt-4 sm:mt-6">
            <button
              onClick={onUseTimeout}
              className="w-full bg-gradient-to-r from-purple-600/80 to-purple-500/80 text-white px-4 sm:px-6 py-3 rounded-xl font-bold
                       border border-purple-400/40 hover:from-purple-700/80 hover:to-purple-600/80 transition-all duration-300
                       shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.4)]
                       transform hover:scale-[1.02]"
            >
              USE TIMEOUT ({timeoutsRemaining} LEFT)
            </button>
          </div>
        )}

        {/* Answer Explanation */}
        {isAnswerRevealed && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20">
            <p className="text-white text-sm sm:text-base">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
