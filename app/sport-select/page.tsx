"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/shared/page-container"
import { ContentCard } from "@/components/shared/content-card"

export default function SportSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "single"

  const handleSportSelect = (sport: string) => {
    router.push(`/setup?mode=${mode}&sport=${sport}`)
  }

  return (
    <PageContainer
      title="SELECT YOUR SPORT"
      subtitle="Choose which sport you want to test your knowledge in"
    >
      <ContentCard>
        <Button
          onClick={() => handleSportSelect("basketball")}
          className="w-full h-16 text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          <img src="https://img.icons8.com/ios-filled/96/ffffff/basketball.png" alt="Basketball" className="h-8 w-8" />
          Basketball
        </Button>

        <Button
          onClick={() => handleSportSelect("soccer")}
          className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          <img src="https://img.icons8.com/ios-filled/96/ffffff/football2--v1.png" alt="Soccer" className="h-8 w-8" />
          Soccer
        </Button>

        <Button
          onClick={() => handleSportSelect("football")}
          className="w-full h-16 text-lg font-bold bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          <img src="https://img.icons8.com/ios-filled/96/ffffff/american-football.png" alt="Football" className="h-8 w-8" />
          Football
        </Button>

        <Button
          onClick={() => handleSportSelect("baseball")}
          className="w-full h-16 text-lg font-bold bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 border-0 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          <img src="https://img.icons8.com/ios-filled/96/ffffff/baseball.png" alt="Baseball" className="h-8 w-8" />
          Baseball
        </Button>

        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          className="w-full h-12 text-white/90 hover:text-white hover:bg-white/10 rounded-xl text-base"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          Back to Main Menu
        </Button>
      </ContentCard>
    </PageContainer>
  )
}
