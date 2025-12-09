"use client"

import type React from "react"

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

type Mode = "create" | "start" | "end" | "edge" | "delete"

export default function DijkstraCustom() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [mode, setMode] = useState<Mode>("create")
  const [startNode, setStartNode] = useState<number | null>(null)
  const [endNode, setEndNode] = useState<number | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [edgePath, setEdgePath] = useState<number | null>(null)
  const [edgeWeight, setEdgeWeight] = useState("1")

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

    const hasNegativeWeight = edges.some((e) => e.weight <= 0)
    if (hasNegativeWeight) {
      alert(
        "⚠️ Lỗi: Dijkstra chỉ hoạt động với trọng số dương!\n\nĐồ thị của bạn có trọng số ≤ 0.\n\nGiải pháp:\n- Tăng tất cả trọng số > 0\n- Hoặc sử dụng thuật toán Bellman-Ford (xử lý trọng số âm)",
      )
      return
    }

    setIsAnimating(true)

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

  // Xử lý click canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Kiểm tra xem có click vào node nào không
    let clickedNode: Node | null = null
    for (const node of nodes) {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      if (dist < 24) {
        clickedNode = node
        break
      }
    }

    if (mode === "create") {
      if (!clickedNode) {
        const newNode = { id: Math.max(...nodes.map((n) => n.id), -1) + 1, x, y }
        setNodes([...nodes, newNode])
      }
    } else if (mode === "start") {
      if (clickedNode) {
        setStartNode(clickedNode.id)
        setMode("create")
      }
    } else if (mode === "end") {
      if (clickedNode) {
        setEndNode(clickedNode.id)
        setMode("create")
      }
    } else if (mode === "edge") {
      if (clickedNode) {
        if (edgePath === null) {
          setEdgePath(clickedNode.id)
        } else if (edgePath !== clickedNode.id) {
          addEdge(edgePath, clickedNode.id, Number.parseInt(edgeWeight))
          setEdgePath(null)
          setEdgeWeight("1")
        }
      }
    } else if (mode === "delete") {
      if (clickedNode) {
        removeNode(clickedNode.id)
      }
    }
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

    // Vẽ node được chọn cho cạnh
    if (edgePath !== null) {
      const node = nodes.find((n) => n.id === edgePath)
      if (node) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 32, 0, Math.PI * 2)
        ctx.strokeStyle = "#f59e0b"
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    // Vẽ nodes
    nodes.forEach((node) => {
      const isStart = node.id === startNode
      const isEnd = node.id === endNode
      const isVisited = result?.visited?.has(node.id)
      const isPath = result?.path?.includes(node.id)

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

      ctx.fillStyle = isStart || isEnd || isPath ? "white" : "#1f2937"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(node.id), node.x, node.y)
    })
  }, [nodes, edges, result, startNode, endNode, edgePath])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2.5 space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Đồ Thị Tương Tác</CardTitle>
              <CardDescription>
                {mode === "create" && "Chế độ: Tạo nút (Click để thêm)"}
                {mode === "start" && "Chế độ: Chọn nút bắt đầu"}
                {mode === "end" && "Chế độ: Chọn nút kết thúc"}
                {mode === "edge" && "Chế độ: Tạo cạnh (Click 2 nút liên tiếp)"}
                {mode === "delete" && "Chế độ: Xóa nút"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={700}
                height={500}
                className="w-full border border-border/50 rounded-lg bg-background cursor-pointer shadow-lg"
                onClick={handleCanvasClick}
              />
            </CardContent>
          </Card>

          {/* Result */}
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

        {/* Controls Panel */}
        <div className="lg:col-span-1.5 space-y-4">
          {/* Mode Selection */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg">Chế Độ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => {
                  setMode("create")
                  setEdgePath(null)
                }}
                variant={mode === "create" ? "default" : "outline"}
                className="w-full justify-start"
              >
                <span className="mr-2">➕</span> Tạo Nút
              </Button>
              <Button
                onClick={() => setMode("start")}
                variant={mode === "start" ? "default" : "outline"}
                className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400"
              >
                <span className="mr-2 w-3 h-3 bg-blue-500 rounded-full"></span> Bắt Đầu
              </Button>
              <Button
                onClick={() => setMode("end")}
                variant={mode === "end" ? "default" : "outline"}
                className="w-full justify-start bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400"
              >
                <span className="mr-2 w-3 h-3 bg-red-500 rounded-full"></span> Kết Thúc
              </Button>
              <Button
                onClick={() => setMode("edge")}
                variant={mode === "edge" ? "default" : "outline"}
                className="w-full justify-start"
              >
                <span className="mr-2">🔗</span> Tạo Cạnh
              </Button>
              <Button
                onClick={() => {
                  setMode("delete")
                  setEdgePath(null)
                }}
                variant={mode === "delete" ? "destructive" : "outline"}
                className="w-full justify-start"
              >
                <span className="mr-2">🗑️</span> Xóa Nút
              </Button>
            </CardContent>
          </Card>

          {/* Edge Weight Control */}
          {mode === "edge" && (
            <Card className="glassmorphism border-amber-500/50 bg-amber-500/10">
              <CardHeader>
                <CardTitle className="text-sm">Trọng Số Cạnh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={edgeWeight}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "" || Number(val) > 0) {
                        setEdgeWeight(val)
                      }
                    }}
                    className="w-full px-3 py-2 rounded border border-border/50 bg-card text-sm"
                    placeholder="Nhập trọng số (> 0)"
                  />
                  {edgePath !== null && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Nút đầu: {edgePath} - Click nút cuối để kết nối
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">
                    💡 Dijkstra chỉ hoạt động với trọng số dương. Để xử lý trọng số âm, sử dụng Bellman-Ford.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Selection */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-sm">Trạng Thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm">
                  {startNode !== null ? `Bắt đầu: Nút ${startNode}` : "Chưa chọn bắt đầu"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">{endNode !== null ? `Kết thúc: Nút ${endNode}` : "Chưa chọn kết thúc"}</span>
              </div>
              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <p>
                  Nút: {nodes.length} | Cạnh: {edges.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Button
            onClick={runDijkstra}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 text-white font-semibold"
            disabled={isAnimating || startNode === null || endNode === null}
          >
            {isAnimating ? "⏳ Đang Chạy..." : "▶ Chạy Dijkstra"}
          </Button>

          <Button
            onClick={() => {
              setNodes([])
              setEdges([])
              setResult(null)
              setStartNode(null)
              setEndNode(null)
              setMode("create")
              setEdgePath(null)
            }}
            variant="outline"
            className="w-full"
          >
            🔄 Xóa Toàn Bộ
          </Button>

          {/* Node List */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-sm">Danh Sách Nút</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {nodes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Không có nút nào</p>
              ) : (
                nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition ${
                      startNode === node.id || endNode === node.id
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-card/50 border border-border/50 hover:bg-card/80"
                    }`}
                    onClick={() => (startNode === node.id ? setStartNode(null) : setStartNode(node.id))}
                  >
                    <span className="font-mono">Nút #{node.id}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 h-5 px-1.5 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNode(node.id)
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Edge List */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-sm">Danh Sách Cạnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {edges.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Không có cạnh nào</p>
              ) : (
                edges.map((edge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded text-xs bg-card/50 border border-border/50"
                  >
                    <span className="font-mono">
                      {edge.from} → {edge.to} : {edge.weight}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 h-5 px-1.5 text-xs"
                      onClick={() => removeEdge(edge.from, edge.to)}
                    >
                      ✕
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
