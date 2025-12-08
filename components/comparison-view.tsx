"use client"
import GraphVisualizer from "@/components/graph-visualizer"
import TestCases from "@/components/test-cases"
import AlgorithmComparison from "@/components/algorithm-comparison"

type TestCase = {
  id: string
  name: string
  nodes: number[][]
  edges: [number, number, number][]
  start: number
  end: number
  description: string
}

interface ComparisonViewProps {
  selectedCase: TestCase | null
  setSelectedCase: (testCase: TestCase) => void
  isAnimating: boolean
  setIsAnimating: (animating: boolean) => void
}

export default function ComparisonView({
  selectedCase,
  setSelectedCase,
  isAnimating,
  setIsAnimating,
}: ComparisonViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main visualization */}
      <div className="lg:col-span-2">
        <GraphVisualizer
          testCase={selectedCase}
          isAnimating={isAnimating}
          onAnimatingChange={setIsAnimating}
          algorithmFilter="all"
        />
      </div>

      {/* Right sidebar */}
      <div className="space-y-6">
        <AlgorithmComparison testCase={selectedCase} isAnimating={isAnimating} />
        <TestCases selectedCase={selectedCase} onSelectCase={setSelectedCase} onAnimatingChange={setIsAnimating} />
      </div>
    </div>
  )
}
