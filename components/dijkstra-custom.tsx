"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dijkstra } from "@/lib/algorithms"

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

export default function DijkstraCustom() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [nodeInput, setNodeInput] = useState("")
  const [startNode, setStartNode] = useState<number | null>(null)
  const [endNode, setEndNode] = useState<number | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [editingEdge, setEditingEdge] = useState<{ from: number; weight: string } | null>(null)

  // Thêm node mới
  const addNode = () => {
    const id = Math.max(...nodes.map((n) => n.id), -1) + 1
    const x = Math.random() * 600 + 100
    const y = Math.random() * 400 + 100
    setNodes([...nodes, { id, x, y }])
  }

  // Xóa node
  const removeNode = (id: number) => {
    setNodes(nodes.filter((n) => n.id !== id))
    setEdges(edges.filter((e) => e.from !== id && e.to !== id))
    if (startNode === id) setStartNode(null)
    if (endNode === id) setEndNode(null)
  }

  // Thêm cạnh
  const addEdge = (from: number, to: number, weight: number) => {
    if (from === to) return
    const exists = edges.some((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from))
    if (!exists) {
      setEdges([...edges, { from, to, weight }])
    }
  }

  // Xóa cạnh
  const removeEdge = (from: number, to: number) => {
    setEdges(edges.filter((e) => !(e.from === from && e.to === to) && !(e.from === to && e.to === from)))
  }

  // Chạy Dijkstra
  const runDijkstra = () => {
    if (startNode === null || endNode === null || nodes.length === 0) {
      alert("Vui lòng chọn điểm bắt đầu và kết thúc")
      return
    }

    setIsAnimating(true)

    // Xây dựng đồ thị
    const graph: { [key: number]: Array<[number, number]> } = {}
    nodes.forEach((n) => {
      graph[n.id] = []
    })

    edges.forEach((e) => {
      graph[e.from].push([e.to, e.weight])
      graph[e.to].push([e.from, e.weight])
    })

    const dijkstraResult = dijkstra(graph, startNode, endNode)
    setResult(dijkstraResult)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  // Vẽ canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "rgb(247, 247, 247)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Vẽ edges
    edges.forEach((edge) => {
      const from = nodes.find((n) => n.id === edge.from)
      const to = nodes.find((n) => n.id === edge.to)
      if (!from || !to) return

      // Gradient line
      const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
      gradient.addColorStop(0, "#8b5cf6")
      gradient.addColorStop(1, "#ec4899")

      ctx.strokeStyle = result?.path?.includes(edge.from) && result?.path?.includes(edge.to) ? "#16a34a" : "#e5e7eb"
      ctx.lineWidth = result?.path?.includes(edge.from) && result?.path?.includes(edge.to) ? 3 : 2
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()

      // Weight label
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${edge.weight}`, midX, midY - 8)
    })

    // Vẽ nodes
    nodes.forEach((node) => {
      const isStart = node.id === startNode
      const isEnd = node.id === endNode
      const isVisited = result?.visited?.has(node.id)
      const isPath = result?.path?.includes(node.id)

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, isStart || isEnd ? 28 : 24, 0, Math.PI * 2)

      if (isStart) {
        ctx.fillStyle = "#3b82f6"
      } else if (isEnd) {
        ctx.fillStyle = "#ef4444"
      } else if (isPath) {
        ctx.fillStyle = "#10b981"
      } else if (isVisited) {
        ctx.fillStyle = "#fbbf24"
      } else {
        ctx.fillStyle = "#f3f4f6"
      }

      ctx.fill()
      ctx.strokeStyle = isStart || isEnd ? "#1e40af" : "#d1d5db"
      ctx.lineWidth = 2
      ctx.stroke()

      // Node label
      ctx.fillStyle = isStart || isEnd || isPath ? "white" : "#1f2937"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(node.id), node.x, node.y)
    })

    // Dark mode support
    if (document.documentElement.classList.contains("dark")) {
      const canvas2d = canvasRef.current
      if (canvas2d) {
        ctx.fillStyle = "rgb(15, 23, 42)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [nodes, edges, result, startNode, endNode])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Đồ Thị Tương Tác</CardTitle>
              <CardDescription>Nhấp vào node để chọn điểm bắt đầu/kết thúc hoặc tạo cạnh</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full border border-border/50 rounded-lg bg-background cursor-pointer shadow-lg"
                onClick={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect()
                  if (!rect) return

                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top

                  // Check if clicked on a node
                  for (const node of nodes) {
                    const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
                    if (dist < 24) {
                      if (e.button === 0) {
                        // Left click - set as start
                        setStartNode(node.id)
                      }
                      if (e.button === 2) {
                        // Right click - set as end
                        setEndNode(node.id)
                      }
                      return
                    }
                  }

                  // Tạo node mới
                  const newNode = { id: Math.max(...nodes.map((n) => n.id), -1) + 1, x, y }
                  setNodes([...nodes, newNode])
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  const rect = canvasRef.current?.getBoundingClientRect()
                  if (!rect) return

                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top

                  for (const node of nodes) {
                    const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
                    if (dist < 24) {
                      removeNode(node.id)
                      return
                    }
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Info */}
          {result && (
            <Card className="glassmorphism border-green-500/50 bg-green-500/10">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">Kết Quả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Khoảng Cách</p>
                    <p className="text-2xl font-bold text-primary">
                      {result.distance === Number.POSITIVE_INFINITY ? "∞" : result.distance.toFixed(1)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nút Đã Duyệt</p>
                    <p className="text-2xl font-bold text-secondary">{result.visited.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Thời Gian</p>
                    <p className="text-2xl font-bold text-accent">{result.time.toFixed(3)}ms</p>
                  </div>
                </div>
                {result.path.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Đường Đi</p>
                    <p className="font-mono text-sm">{result.path.join(" → ")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg">Điều Khiển</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nút Bắt Đầu</label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700"></div>
                  <span className="text-sm">{startNode !== null ? `Nút ${startNode}` : "Chưa chọn"}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Nút Kết Thúc</label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-red-700"></div>
                  <span className="text-sm">{endNode !== null ? `Nút ${endNode}` : "Chưa chọn"}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Hướng Dẫn:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Click: Tạo/Chọn nút</li>
                  <li>• Phải Click: Xóa nút</li>
                  <li>• Nút trái: Điểm bắt đầu</li>
                  <li>• Nút phải: Điểm kết thúc</li>
                </ul>
              </div>

              <Button
                onClick={runDijkstra}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30"
                disabled={isAnimating}
              >
                {isAnimating ? "Đang Chạy..." : "Chạy Dijkstra"}
              </Button>

              <Button
                onClick={() => {
                  setNodes([])
                  setEdges([])
                  setResult(null)
                  setStartNode(null)
                  setEndNode(null)
                }}
                variant="outline"
                className="w-full"
              >
                Xóa Toàn Bộ
              </Button>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg">Nút ({nodes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-2 rounded bg-card/50 border border-border/50"
                >
                  <span className="text-sm font-mono">#{node.id}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 h-6 px-2"
                    onClick={() => removeNode(node.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              {nodes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Click vào canvas để thêm nút</p>
              )}
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg">Cạnh ({edges.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {edges.map((edge, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-card/50 border border-border/50"
                >
                  <span className="text-xs font-mono">
                    {edge.from}→{edge.to}: {edge.weight}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 h-6 px-2"
                    onClick={() => removeEdge(edge.from, edge.to)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              {nodes.length >= 2 && edges.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center py-2">Tạo cạnh giữa các nút</p>
                  {nodes.slice(0, 2).map((n1) =>
                    nodes
                      .filter((n2) => n2.id > n1.id)
                      .slice(0, 1)
                      .map((n2) => (
                        <Button
                          key={`${n1.id}-${n2.id}`}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs bg-transparent"
                          onClick={() => addEdge(n1.id, n2.id, Math.floor(Math.random() * 9) + 1)}
                        >
                          Nối {n1.id}→{n2.id}
                        </Button>
                      )),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
