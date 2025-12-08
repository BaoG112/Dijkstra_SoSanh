"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { dijkstra, bfs, dfs, aStar } from "@/lib/algorithms"

type TestCase = {
  id: string
  name: string
  nodes: number[][]
  edges: [number, number, number][]
  start: number
  end: number
  description: string
}

interface MetricResult {
  name: string
  distance: number
  nodesVisited: number
  time: number
  pathLength: number
}

interface AlgorithmComparisonProps {
  testCase: TestCase | null
  isAnimating: boolean
}

export default function AlgorithmComparison({ testCase, isAnimating }: AlgorithmComparisonProps) {
  const [metrics, setMetrics] = useState<MetricResult[]>([])
  const [comparing, setComparing] = useState(false)

  const runComparison = useCallback(async () => {
    if (!testCase) return

    setComparing(true)
    const results: MetricResult[] = []

    // Build graph
    const graph: { [key: number]: Array<[number, number]> } = {}
    testCase.nodes.forEach((_, idx) => {
      graph[idx] = []
    })
    testCase.edges.forEach(([from, to, weight]) => {
      graph[from].push([to, weight])
    })

    // Build nodes array
    const nodes = testCase.nodes.map((coords, idx) => ({
      id: idx,
      x: coords[0],
      y: coords[1],
    }))

    // Run all algorithms
    const algorithms = [
      { name: "Dijkstra", fn: dijkstra },
      { name: "BFS", fn: bfs },
      { name: "DFS", fn: dfs },
      { name: "A*", fn: aStar },
    ]

    for (const algo of algorithms) {
      const result =
        algo.name === "A*"
          ? aStar(graph, testCase.start, testCase.end, nodes)
          : algo.fn(graph, testCase.start, testCase.end)

      results.push({
        name: algo.name,
        distance: result.distance,
        nodesVisited: result.visited.size,
        time: Number.parseFloat(result.time.toFixed(4)),
        pathLength: result.path.length,
      })

      // Add small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setMetrics(results)
    setComparing(false)
  }, [testCase])

  useEffect(() => {
    if (testCase && !isAnimating) {
      setMetrics([])
    }
  }, [testCase, isAnimating])

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Algorithm Comparison</h2>
          <p className="text-sm text-muted-foreground">Performance metrics across different pathfinding algorithms</p>
        </div>

        <button
          onClick={runComparison}
          disabled={!testCase || isAnimating || comparing}
          className="w-full px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg font-medium transition-colors"
        >
          {comparing ? "Comparing..." : "Run Comparison"}
        </button>

        {metrics.length > 0 && (
          <div className="space-y-3">
            {metrics.map((result) => (
              <div key={result.name} className="border border-border rounded-lg p-4 bg-card/50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-foreground">{result.name}</h3>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {result.pathLength > 0 ? "Path Found" : "No Path"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Distance</span>
                    <span className="font-mono font-semibold text-foreground">
                      {result.distance === Number.POSITIVE_INFINITY ? "∞" : result.distance.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Nodes Visited</span>
                    <span className="font-mono font-semibold text-foreground">{result.nodesVisited}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Path Length</span>
                    <span className="font-mono font-semibold text-foreground">{result.pathLength}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Time (ms)</span>
                    <span className="font-mono font-semibold text-foreground">{result.time.toFixed(3)}</span>
                  </div>
                </div>

                {/* Visual bar for nodes visited */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{
                          width: `${Math.min((result.nodesVisited / (testCase?.nodes.length ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((result.nodesVisited / (testCase?.nodes.length ?? 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Comparison summary */}
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="font-semibold text-sm mb-3 text-foreground">Algorithm Characteristics</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Dijkstra:</strong> Guaranteed shortest path with weights, explores
                  many nodes.
                </p>
                <p>
                  <strong className="text-foreground">BFS:</strong> Explores level by level, ideal for unweighted
                  graphs, memory intensive.
                </p>
                <p>
                  <strong className="text-foreground">DFS:</strong> Goes deep first, uses less memory, doesn't guarantee
                  shortest path.
                </p>
                <p>
                  <strong className="text-foreground">A*:</strong> Uses heuristic to guide search, often most efficient,
                  fewer nodes visited.
                </p>
              </div>
            </div>
          </div>
        )}

        {metrics.length === 0 && (
          <div className="p-4 bg-muted/30 rounded-lg text-center text-muted-foreground text-sm">
            Run comparison to see algorithm metrics
          </div>
        )}
      </div>
    </Card>
  )
}
