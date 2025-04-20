import React from 'react'

interface ContentCardProps {
  children: React.ReactNode
  title?: string
  showSportsIcons?: boolean
}

export function ContentCard({
  children,
  title,
  showSportsIcons = false
}: ContentCardProps) {
  return (
    <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-20 p-1">
      <div className="bg-gradient-to-br from-blue-900/50 to-red-900/50 rounded-3xl p-8">
        {title && (
          <h2
            className="text-2xl font-bold text-center text-white mb-6"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            {title}
          </h2>
        )}

        <div className="space-y-6">
          {children}
        </div>

        {showSportsIcons && (
          <div className="relative h-20 mt-8">
            <img
              src="https://img.icons8.com/ios-filled/96/ffffff/basketball.png"
              alt="Basketball"
              className="absolute w-12 h-12 left-0 top-0 animate-float"
              style={{ animationDelay: "0s" }}
            />
            <img
              src="https://img.icons8.com/ios-filled/96/ffffff/football2--v1.png"
              alt="Soccer"
              className="absolute w-12 h-12 left-[30%] top-4 animate-float"
              style={{ animationDelay: "0.5s" }}
            />
            <img
              src="https://img.icons8.com/ios-filled/96/ffffff/american-football.png"
              alt="Football"
              className="absolute w-12 h-12 right-[30%] top-2 animate-float"
              style={{ animationDelay: "1s" }}
            />
            <img
              src="https://img.icons8.com/ios-filled/96/ffffff/baseball.png"
              alt="Baseball"
              className="absolute w-12 h-12 right-0 top-6 animate-float"
              style={{ animationDelay: "1.5s" }}
            />
          </div>
        )}
      </div>
    </div>
  )
} 