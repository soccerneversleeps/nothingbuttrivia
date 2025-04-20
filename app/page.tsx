import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/shared/page-container"
import { ContentCard } from "@/components/shared/content-card"

export default function Home() {
  return (
    <PageContainer>
      <ContentCard title="CHOOSE YOUR ADVENTURE!" showSportsIcons>
        <Link href="/sport-select?mode=single" className="w-full block">
          <Button
            variant="default"
            size="lg"
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            🎮 PLAY SOLO
          </Button>
        </Link>

        <Link href="/sport-select?mode=multi" className="w-full block">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            🏆 CHALLENGE A FRIEND
          </Button>
        </Link>

        <Link href="/join" className="w-full block mt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            🤝 JOIN GAME
          </Button>
        </Link>

        <Link href="/how-to-play" className="block mt-8">
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 text-white/90 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 group transition-all duration-300"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            HOW TO PLAY
          </Button>
        </Link>
      </ContentCard>
    </PageContainer>
  )
}
