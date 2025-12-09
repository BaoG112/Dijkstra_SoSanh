"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dijkstra, bfs, dfs, aStar, bellmanFord, floydWarshall } from "@/lib/algorithms"

interface ComparisonMode {
  id: string
  name: string
  algorithms: [string, string]
  icon: string
  description: string
  graph: TestGraph
}

const comparisonModes: ComparisonMode[] = [
  {
    id: "dijkstra-bellman",
    name: "Dijkstra vs Bellman-Ford",
    algorithms: ["dijkstra", "bellmanFord"],
    icon: "⚔️",
    description: "Dijkstra không xử lý trọng số âm, Bellman-Ford có thể",
    graph: {
      name: "Trọng Số Âm",
      nodes: [
        { id: 0, x: 100, y: 200 },
        { id: 1, x: 250, y: 100 },
        { id: 2, x: 250, y: 300 },
        { id: 3, x: 400, y: 200 },
      ],
      edges: [
        { from: 0, to: 1, weight: 4 },
        { from: 0, to: 2, weight: 2 },
        { from: 1, to: 3, weight: -3 },
        { from: 2, to: 1, weight: 1 },
        { from: 2, to: 3, weight: 5 },
      ],
      start: 0,
      end: 3,
    },
  },
  {
    id: "dijkstra-bfs",
    name: "Dijkstra vs BFS",
    algorithms: ["dijkstra", "bfs"],
    icon: "🔄",
    description: "BFS nhanh với trọng số bằng nhau, Dijkstra tối ưu với trọng số khác nhau",
    graph: {
      name: "Trọng Số Bằng Nhau",
      nodes: [
        { id: 0, x: 100, y: 200 },
        { id: 1, x: 200, y: 100 },
        { id: 2, x: 200, y: 300 },
        { id: 3, x: 300, y: 200 },
        { id: 4, x: 400, y: 150 },
      ],
      edges: [
        { from: 0, to: 1, weight: 1 },
        { from: 0, to: 2, weight: 1 },
        { from: 1, to: 3, weight: 1 },
        { from: 2, to: 3, weight: 1 },
        { from: 3, to: 4, weight: 1 },
      ],
      start: 0,
      end: 4,
    },
  },
  {
    id: "dijkstra-dfs",
    name: "Dijkstra vs DFS",
    algorithms: ["dijkstra", "dfs"],
    icon: "🌳",
    description: "DFS không tối ưu đường đi ngắn nhất, Dijkstra luôn tìm được đường tốt nhất",
    graph: {
      name: "Đa Đường",
      nodes: [
        { id: 0, x: 100, y: 200 },
        { id: 1, x: 200, y: 100 },
        { id: 2, x: 200, y: 300 },
        { id: 3, x: 300, y: 200 },
      ],
      edges: [
        { from: 0, to: 1, weight: 10 },
        { from: 0, to: 2, weight: 2 },
        { from: 1, to: 3, weight: 1 },
        { from: 2, to: 3, weight: 10 },
      ],
      start: 0,
      end: 3,
    },
  },
  {
    id: "dijkstra-floyd",
    name: "Dijkstra vs Floyd-Warshall",
    algorithms: ["dijkstra", "floydWarshall"],
    icon: "🔀",
    description: "Dijkstra: 1 nguồn → nhiều đích, Floyd-Warshall: tất cả cặp đỉnh",
    graph: {
      name: "Đồ Thị Đa Hướng",
      nodes: [
        { id: 0, x: 80, y: 150 },
        { id: 1, x: 200, y: 100 },
        { id: 2, x: 200, y: 200 },
        { id: 3, x: 320, y: 150 },
      ],
      edges: [
        { from: 0, to: 1, weight: 5 },
        { from: 0, to: 2, weight: 3 },
        { from: 1, to: 3, weight: 2 },
        { from: 2, to: 1, weight: 1 },
        { from: 2, to: 3, weight: 4 },
      ],
      start: 0,
      end: 3,
    },
  },
]

interface TestGraph {
  name: string
  nodes: Array<{ id: number; x: number; y: number }>
  edges: Array<{ from: number; to: number; weight: number }>
  start: number
  end: number
}

function ComparisonVisualizer({
  nodes,
  edges,
  start,
  end,
  algorithm,
  isRunning,
  onComplete,
}: {
  nodes: Array<{ id: number; x: number; y: number }>
  edges: Array<{ from: number; to: number; weight: number }>
  start: number
  end: number
  algorithm: string
  isRunning: boolean
  onComplete: (result: any) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<VisualizerState>({
    visitedNodes: [],
    path: [],
    distance: 0,
    time: 0,
    isRunning: false,
  })

  useEffect(() => {
    if (!isRunning) return

    const runAsync = async () => {
      const graph: { [key: number]: Array<[number, number]> } = {}
      nodes.forEach((n) => {
        graph[n.id] = []
      })
      edges.forEach((e) => {
        graph[e.from].push([e.to, e.weight])
      })

      let result
      const startTime = performance.now()

      try {
        switch (algorithm) {
          case "dijkstra":
            result = dijkstra(graph, start, end)
            break
          case "bellmanFord":
            result = bellmanFord(graph, start, end)
            break
          case "bfs":
            result = bfs(graph, start, end)
            break
          case "dfs":
            result = dfs(graph, start, end)
            break
          case "aStar":
            result = aStar(graph, start, end, nodes)
            break
          case "floydWarshall":
            result = floydWarshall(graph)
            break
          default:
            return
        }

        const endTime = performance.now()

        // Animate visited nodes
        const visitedArray = Array.from(result.visited)
        for (let i = 0; i < visitedArray.length; i++) {
          await new Promise((resolve) => {
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                visitedNodes: [...prev.visitedNodes, visitedArray[i]],
              }))
              resolve(null)
            }, 50)
          })
        }

        // Show path
        setState((prev) => ({
          ...prev,
          path: result.path,
          distance: result.distance,
          time: endTime - startTime,
          isRunning: false,
        }))

        onComplete({
          path: result.path,
          distance: result.distance,
          visited: visitedArray.length,
          time: endTime - startTime,
        })
      } catch (error) {
        setState((prev) => ({ ...prev, isRunning: false }))
      }
    }

    runAsync()
  }, [isRunning, algorithm, nodes, edges, start, end, onComplete])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "rgb(245, 245, 247)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    edges.forEach(({ from, to, weight }) => {
      const fromNode = nodes[from]
      const toNode = nodes[to]

      const isInPath = state.path.includes(from) && state.path.includes(to)

      if (isInPath) {
        ctx.strokeStyle = "rgb(59, 130, 246)"
        ctx.lineWidth = 3
      } else if (state.visitedNodes.includes(from) && state.visitedNodes.includes(to)) {
        ctx.strokeStyle = "rgb(249, 115, 22)"
        ctx.lineWidth = 2
        ctx.setLineDash([4, 2])
      } else {
        ctx.strokeStyle = "rgb(200, 200, 200)"
        ctx.lineWidth = 1.5
      }

      ctx.beginPath()
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.lineTo(toNode.x, toNode.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw weight
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2
      ctx.fillStyle = "rgb(80, 80, 80)"
      ctx.font = "11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(weight.toString(), midX, midY - 8)
    })

    // Draw nodes
    nodes.forEach((node) => {
      const isStart = node.id === start
      const isEnd = node.id === end
      const isVisited = state.visitedNodes.includes(node.id)
      const isInPath = state.path.includes(node.id)

      if (isStart) {
        ctx.fillStyle = "rgb(34, 197, 94)"
      } else if (isEnd) {
        ctx.fillStyle = "rgb(239, 68, 68)"
      } else if (isInPath) {
        ctx.fillStyle = "rgb(59, 130, 246)"
      } else if (isVisited) {
        ctx.fillStyle = "rgb(168, 85, 247)"
      } else {
        ctx.fillStyle = "rgb(255, 255, 255)"
      }

      ctx.beginPath()
      ctx.arc(node.x, node.y, 18, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = isInPath || isStart || isEnd ? "rgb(59, 130, 246)" : "rgb(150, 150, 150)"
      ctx.lineWidth = isInPath || isStart || isEnd ? 2 : 1.5
      ctx.stroke()

      ctx.fillStyle = isStart || isEnd || isInPath ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.id.toString(), node.x, node.y)
    })
  }, [nodes, edges, state, start, end])

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} width={450} height={350} className="w-full border border-border rounded-lg bg-card" />
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-primary/10 p-2 rounded text-center">
          <p className="text-xs text-muted-foreground">Nút Duyệt</p>
          <p className="font-bold text-primary">{state.visitedNodes.length}</p>
        </div>
        <div className="bg-secondary/10 p-2 rounded text-center">
          <p className="text-xs text-muted-foreground">Khoảng Cách</p>
          <p className="font-bold text-secondary">
            {state.distance === Number.POSITIVE_INFINITY ? "∞" : state.distance.toFixed(1)}
          </p>
        </div>
        <div className="bg-accent/10 p-2 rounded text-center">
          <p className="text-xs text-muted-foreground">Thời Gian</p>
          <p className="font-bold text-accent">{state.time.toFixed(2)}ms</p>
        </div>
      </div>
    </div>
  )
}

interface VisualizerState {
  visitedNodes: number[]
  path: number[]
  distance: number
  time: number
  isRunning: boolean
}

export default function ComparisonCustom() {
  const [selectedMode, setSelectedMode] = useState<ComparisonMode>(comparisonModes[0])
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>({})

  const selectedGraph = selectedMode.graph

  const handleRunComparison = () => {
    setIsRunning(true)
    setResults({})
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-balance">So Sánh Thuật Toán</h2>
        <p className="text-muted-foreground">Chọn chế độ so sánh để xem hiệu suất của từng thuật toán</p>
      </div>

      {/* Mode Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
          <h3 className="font-semibold text-lg">Chế Độ So Sánh</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comparisonModes.map((mode) => (
            <div key={mode.id} className="space-y-2">
              <Button
                onClick={() => {
                  setSelectedMode(mode)
                  setResults({})
                }}
                variant={selectedMode.id === mode.id ? "default" : "outline"}
                className={`w-full justify-start h-12 px-4 transition-all ${
                  selectedMode.id === mode.id
                    ? "bg-gradient-to-r from-primary to-primary/80 border-0 text-white shadow-md"
                    : "border border-border/50 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <span className="text-lg mr-2">{mode.icon}</span>
                <span className="font-medium text-sm">{mode.name}</span>
              </Button>
              {selectedMode.id === mode.id && <p className="text-xs text-muted-foreground px-1">{mode.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <Button
        onClick={handleRunComparison}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-accent to-accent/80 hover:shadow-lg hover:shadow-accent/30 transition-all"
        disabled={isRunning}
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Đang So Sánh...
          </span>
        ) : (
          <span>▶ Chạy So Sánh</span>
        )}
      </Button>

      {/* Side by Side Visualization */}
      {(isRunning || Object.keys(results).length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedMode.algorithms.map((algo) => (
            <Card key={algo} className="glassmorphism overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-3 border-b border-border/50">
                <CardTitle className="text-lg">
                  {algo === "bellmanFord"
                    ? "Bellman-Ford"
                    : algo === "floydWarshall"
                      ? "Floyd-Warshall"
                      : algo.charAt(0).toUpperCase() + algo.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ComparisonVisualizer
                  nodes={selectedGraph.nodes}
                  edges={selectedGraph.edges}
                  start={selectedGraph.start}
                  end={selectedGraph.end}
                  algorithm={algo}
                  isRunning={isRunning}
                  onComplete={(result) => {
                    setResults((prev: any) => {
                      const updated = {
                        ...prev,
                        [algo]: result,
                      }
                      return updated
                    })
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
