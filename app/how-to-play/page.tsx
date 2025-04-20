import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/shared/page-container"
import { ContentCard } from "@/components/shared/content-card"

export default function HowToPlay() {
  return (
    <PageContainer title="HOW TO PLAY" subtitle="Learn the rules and get ready to play!">
      <div className="w-full max-w-md mx-auto">
        <ContentCard>
          <div className="text-white space-y-4 p-6">
            {/* Game Objective and Timeouts */}
            <div className="grid grid-cols-2 gap-3">
              {/* Game Objective */}
              <div className="bg-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Game Objective</h2>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🎯</span>
                  <p className="text-sm text-white/90" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                    Be the first player to reach 21 points by correctly answering sports trivia questions.
                  </p>
                </div>
              </div>

              {/* Timeouts */}
              <div className="bg-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Timeouts</h2>
                </div>
                <div className="flex gap-1 mb-2">
                  <span className="text-xl">⏸️</span>
                  <span className="text-xl">⏸️</span>
                  <span className="text-xl">⏸️</span>
                </div>
                <p className="text-sm text-white/90" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  You get 3 timeouts per game. Each timeout gives you 10 extra seconds to think!
                </p>
              </div>
            </div>

            {/* Game Flow */}
            <div className="bg-blue-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Game Flow</h2>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🏀</span>
                  <p className="text-sm text-white/90" style={{ fontFamily: "'Exo 2', sans-serif" }}>Choose your favorite sport: Basketball, Soccer, Football, or Baseball</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔄</span>
                  <p className="text-sm text-white/90" style={{ fontFamily: "'Exo 2', sans-serif" }}>Players take turns answering questions about the selected sport</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">⭐</span>
                  <p className="text-sm text-white/90" style={{ fontFamily: "'Exo 2', sans-serif" }}>Choose between 2-point (easier) or 3-point (harder) questions</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">⏰</span>
                  <p className="text-sm text-white/90" style={{ fontFamily: "'Exo 2', sans-serif" }}>Answer within the 24-second shot clock</p>
                </div>
              </div>
            </div>

            {/* Game Modes and Sports Categories */}
            <div className="grid grid-cols-2 gap-3">
              {/* Game Modes */}
              <div className="bg-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Game Modes</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">🎮</span>
                    <div>
                      <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Single Player</h3>
                      <p className="text-xs text-white/80" style={{ fontFamily: "'Exo 2', sans-serif" }}>Challenge our AI opponent!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xl">🤝</span>
                    <div>
                      <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Challenge a Friend</h3>
                      <p className="text-xs text-white/80" style={{ fontFamily: "'Exo 2', sans-serif" }}>Play with a unique game code!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sports Categories */}
              <div className="bg-blue-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Sports Categories</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 min-w-[45%]">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/basketball.png" alt="Basketball" className="h-5 w-5" />
                    <span className="text-sm text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Basketball</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-[45%]">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/football2--v1.png" alt="Soccer" className="h-5 w-5" />
                    <span className="text-sm text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Soccer</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-[45%]">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/american-football.png" alt="Football" className="h-5 w-5" />
                    <span className="text-sm text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Football</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-[45%]">
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/baseball.png" alt="Baseball" className="h-5 w-5" />
                    <span className="text-sm text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>Baseball</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="flex justify-center pt-2">
              <Link href="/" className="w-full max-w-[160px]">
                <Button
                  variant="ghost"
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-white text-sm rounded-lg py-1.5 px-3 flex items-center justify-center gap-2 transition-colors"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  )
}
