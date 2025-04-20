import React from 'react'

interface PageContainerProps {
  children: React.ReactNode
  showLogo?: boolean
  title?: string
  subtitle?: string
}

export function PageContainer({
  children,
  showLogo = true,
  title = "NOTHING BUT TRIVIA",
  subtitle = "The ultimate sports challenge! Beat the shot clock and reach 21 points first!"
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-red-600 flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-[40%] right-[10%] w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-[20%] left-[20%] w-36 h-36 bg-white rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-[60%] right-[25%] w-28 h-28 bg-red-400 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <header className="container mx-auto py-8 relative z-10">
        {showLogo && (
          <div className="flex justify-center items-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-md animate-pulse"></div>
              <img
                src="https://img.icons8.com/color/96/basketball.png"
                alt="Nothing But Trivia Logo"
                className="h-20 w-20 relative z-10 animate-bounce"
                style={{ animationDuration: "2s" }}
              />
            </div>
          </div>
        )}
        <h1
          className="text-5xl md:text-6xl font-extrabold text-center text-white mt-4 drop-shadow-lg tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-red-200">
            {title}
          </span>
        </h1>
        {subtitle && (
          <p className="text-center text-white text-lg mt-4 max-w-2xl mx-auto drop-shadow">
            {subtitle}
          </p>
        )}
      </header>

      <main className="container mx-auto flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        {children}
      </main>

      <footer className="container mx-auto py-4 text-center text-white/70 text-sm relative z-10">
        &copy; {new Date().getFullYear()} Nothing But Trivia
      </footer>
    </div>
  )
} 