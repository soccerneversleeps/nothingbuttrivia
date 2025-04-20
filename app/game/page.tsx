'use client'

import dynamic from 'next/dynamic'

const GamePageClient = dynamic(() => import('./GamePageClient'))

export default function GamePage() {
  return <GamePageClient />
}
