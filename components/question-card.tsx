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
          bg-black/40 border-white/40 text-white
          hover:bg-black/50 hover:border-white/60
        `
      }
      return `
        bg-black/30 border-white/20 text-white
        hover:bg-black/40 hover:border-white/40
      `
    }

    if (answer === question.correctAnswer) {
      return `
        bg-green-900/40 border-green-500/40 text-white
        shadow-[0_0_15px_rgba(34,197,94,0.3)]
      `
    }

    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return `
        bg-red-900/40 border-red-500/40 text-white
        shadow-[0_0_15px_rgba(239,68,68,0.3)]
      `
    }

    return `bg-black/20 border-white/10 text-white/70`
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg overflow-hidden">
      <CardContent className="p-6">
        {/* Shot Clock and Points */}
        <div className="flex justify-between items-center mb-6">
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
            <span className="text-white/80 font-medium">Points:</span>
            <span className="text-2xl font-bold text-white">{question.pointValue}</span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            {question.question}
          </p>
        </div>

        {/* Answers */}
        <div className="space-y-3">
          {question.answers.map((answer: string, index: number) => (
            <button
              key={answer}
              onClick={() => !isAnswerRevealed && onAnswerSelect(answer)}
              disabled={isAnswerRevealed}
              className={`
                w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden
                backdrop-blur-md border font-medium
                ${getAnswerButtonStyle(answer)}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg">{answer}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Timeout Button */}
        {timeoutsRemaining > 0 && !isAnswerRevealed && (
          <div className="mt-6">
            <button
              onClick={onUseTimeout}
              className="w-full bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold
                       border border-white/20 hover:bg-white/20 transition-all duration-300
                       shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              USE TIMEOUT ({timeoutsRemaining} LEFT)
            </button>
          </div>
        )}

        {/* Answer Explanation */}
        {isAnswerRevealed && (
          <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <p className="text-white/90 font-medium">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
