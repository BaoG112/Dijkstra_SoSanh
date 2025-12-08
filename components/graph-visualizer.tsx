"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { dijkstra, bfs, dfs, aStar } from "@/lib/algorithms"

interface Node {
  id: number
  x: number
  y: number
}

interface Edge {
  from: number
  to: number
  weight: number
}

type TestCase = {
  id: string
  name: string
  nodes: number[][]
  edges: [number, number, number][]
  start: number
  end: number
  description: string
}

type AlgorithmName = "dijkstra" | "bfs" | "dfs" | "a-star"

interface VisualizerProps {
  testCase: TestCase | null
  isAnimating: boolean
  onAnimatingChange: (animating: boolean) => void
  onResult?: (result: any) => void
  algorithmFilter?: "dijkstra" | "all"
}

export default function GraphVisualizer({
  testCase,
  isAnimating,
  onAnimatingChange,
  onResult,
  algorithmFilter = "dijkstra",
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [path, setPath] = useState<number[]>([])
  const [visitedNodes, setVisitedNodes] = useState<number[]>([])
  const [highlightedEdges, setHighlightedEdges] = useState<[number, number][]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmName>("dijkstra")

  // Initialize graph from test case
  useEffect(() => {
    if (!testCase) return

    const newNodes: Node[] = testCase.nodes.map((_, idx) => ({
      id: idx,
      x: testCase.nodes[idx][0],
      y: testCase.nodes[idx][1],
    }))

    const newEdges: Edge[] = testCase.edges.map(([from, to, weight]) => ({
      from,
      to,
      weight,
    }))

    setNodes(newNodes)
    setEdges(newEdges)
    setPath([])
    setVisitedNodes([])
    setHighlightedEdges([])
  }, [testCase])

  // Draw graph on canvas
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "oklch(0.98 0 0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    edges.forEach(({ from, to, weight }) => {
      const fromNode = nodes[from]
      const toNode = nodes[to]

      // Check if edge is in path
      const isInPath =
        (path.includes(from) && path.includes(to)) ||
        highlightedEdges.some((e) => (e[0] === from && e[1] === to) || (e[0] === to && e[1] === from))

      // Edge color based on state
      if (isInPath) {
        ctx.strokeStyle = "oklch(0.48 0.25 257)"
        ctx.lineWidth = 3
      } else if (visitedNodes.includes(from) && visitedNodes.includes(to)) {
        ctx.strokeStyle = "oklch(0.72 0.18 28)"
        ctx.lineWidth = 2
        ctx.setLineDash([4, 2])
      } else {
        ctx.strokeStyle = "oklch(0.91 0 0)"
        ctx.lineWidth = 1.5
      }

      // Draw edge
      ctx.beginPath()
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.lineTo(toNode.x, toNode.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw weight label
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2
      ctx.fillStyle = "oklch(0.556 0 0)"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(weight.toString(), midX, midY - 8)
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isStart = testCase && node.id === testCase.start
      const isEnd = testCase && node.id === testCase.end
      const isVisited = visitedNodes.includes(node.id)
      const isInPath = path.includes(node.id)

      // Node color based on state
      if (isStart) {
        ctx.fillStyle = "oklch(0.65 0.2 163)"
      } else if (isEnd) {
        ctx.fillStyle = "oklch(0.72 0.18 28)"
      } else if (isInPath) {
        ctx.fillStyle = "oklch(0.48 0.25 257)"
      } else if (isVisited) {
        ctx.fillStyle = "oklch(0.65 0.15 142)"
      } else {
        ctx.fillStyle = "oklch(0.99 0 0)"
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, 18, 0, Math.PI * 2)
      ctx.fill()

      // Node border
      ctx.strokeStyle = isInPath || isStart || isEnd ? "oklch(0.48 0.25 257)" : "oklch(0.91 0 0)"
      ctx.lineWidth = isInPath || isStart || isEnd ? 2 : 1.5
      ctx.stroke()

      // Node label
      ctx.fillStyle = isStart || isEnd || isInPath ? "oklch(0.98 0 0)" : "oklch(0.12 0 0)"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.id.toString(), node.x, node.y)
    })
  }, [nodes, edges, path, visitedNodes, highlightedEdges, testCase])

  // Run algorithm
  const runAlgorithm = useCallback(async () => {
    if (!testCase || nodes.length === 0) return

    onAnimatingChange(true)
    setPath([])
    setVisitedNodes([])
    setHighlightedEdges([])

    // Build adjacency list
    const graph: { [key: number]: Array<[number, number]> } = {}
    nodes.forEach((node) => {
      graph[node.id] = []
    })
    edges.forEach(({ from, to, weight }) => {
      graph[from].push([to, weight])
    })

    let result

    switch (selectedAlgorithm) {
      case "dijkstra":
        result = dijkstra(graph, testCase.start, testCase.end)
        break
      case "bfs":
        result = bfs(graph, testCase.start, testCase.end)
        break
      case "dfs":
        result = dfs(graph, testCase.start, testCase.end)
        break
      case "a-star":
        result = aStar(graph, testCase.start, testCase.end, nodes)
        break
    }

    // Animate visited nodes
    const { visited, path: resultPath } = result
    const visitedArray = Array.from(visited)

    for (let i = 0; i < visitedArray.length; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          setVisitedNodes((prev) => [...prev, visitedArray[i]])
          resolve(null)
        }, 50)
      })
    }

    // Animate path
    if (resultPath.length > 0) {
      for (let i = 1; i < resultPath.length; i++) {
        await new Promise((resolve) => {
          setTimeout(() => {
            setHighlightedEdges((prev) => [...prev, [resultPath[i - 1], resultPath[i]]])
          }, 100)
          setTimeout(() => resolve(null), 100)
        })
      }
    }

    setPath(resultPath)

    if (onResult) {
      onResult({
        visited: visitedArray.length,
        distance: result.distance,
        time: result.time,
        path: resultPath,
      })
    }

    onAnimatingChange(false)
  }, [testCase, nodes, edges, selectedAlgorithm, onAnimatingChange, onResult])

  const reset = () => {
    setPath([])
    setVisitedNodes([])
    setHighlightedEdges([])
    if (onResult) onResult(null)
  }

  const showAlgorithmSelect = algorithmFilter === "all"

  return (
    <Card className="p-6 h-full">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {algorithmFilter === "dijkstra" ? "Dijkstra's Algorithm Visualizer" : "Graph Visualization"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {testCase ? testCase.description : "Select a test case to visualize"}
          </p>
        </div>

        <canvas ref={canvasRef} width={500} height={400} className="w-full border border-border rounded-lg bg-card" />

        <div className="space-y-3">
          {showAlgorithmSelect && (
            <div>
              <label className="text-sm font-medium mb-2 block">Algorithm</label>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value as AlgorithmName)}
                disabled={isAnimating}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              >
                <option value="dijkstra">Dijkstra</option>
                <option value="bfs">BFS (Breadth-First Search)</option>
                <option value="dfs">DFS (Depth-First Search)</option>
                <option value="a-star">A* Search</option>
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={runAlgorithm}
              disabled={!testCase || isAnimating}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isAnimating ? "Running..." : "Run Algorithm"}
            </Button>
            <Button onClick={reset} variant="outline" disabled={isAnimating} className="flex-1 bg-transparent">
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
