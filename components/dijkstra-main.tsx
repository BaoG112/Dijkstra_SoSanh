"use client"

import { useState } from "react"
import GraphVisualizer from "@/components/graph-visualizer"
import TestCases from "@/components/test-cases"
import DijkstraInfo from "@/components/dijkstra-info"

type TestCase = {
  id: string
  name: string
  nodes: number[][]
  edges: [number, number, number][]
  start: number
  end: number
  description: string
}

interface DijkstraMainProps {
  selectedCase: TestCase | null
  setSelectedCase: (testCase: TestCase) => void
  isAnimating: boolean
  setIsAnimating: (animating: boolean) => void
}

export default function DijkstraMain({
  selectedCase,
  setSelectedCase,
  isAnimating,
  setIsAnimating,
}: DijkstraMainProps) {
  const [result, setResult] = useState<{
    visited: number
    distance: number
    time: number
    path: number[]
  } | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main visualization - takes 2 cols */}
      <div className="lg:col-span-2">
        <GraphVisualizer
          testCase={selectedCase}
          isAnimating={isAnimating}
          onAnimatingChange={setIsAnimating}
          onResult={setResult}
          algorithmFilter="dijkstra"
        />
      </div>

      {/* Sidebar - info and test cases */}
      <div className="space-y-6">
        <DijkstraInfo result={result} />
        <TestCases selectedCase={selectedCase} onSelectCase={setSelectedCase} onAnimatingChange={setIsAnimating} />
      </div>
    </div>
  )
}
