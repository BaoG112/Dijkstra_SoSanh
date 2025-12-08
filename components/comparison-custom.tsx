"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dijkstra, bfs, dfs, aStar } from "@/lib/algorithms"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface TestCase {
  id: string
  name: string
  description: string
  nodes: Array<{ id: number; x: number; y: number }>
  edges: Array<{ from: number; to: number; weight: number }>
  start: number
  end: number
}

const testCases: TestCase[] = [
  {
    id: "linear",
    name: "Đường Thẳng",
    description: "Đơn giản: 5 nút nối liên tiếp",
    nodes: [
      { id: 0, x: 100, y: 250 },
      { id: 1, x: 250, y: 250 },
      { id: 2, x: 400, y: 250 },
      { id: 3, x: 550, y: 250 },
      { id: 4, x: 700, y: 250 },
    ],
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 3, to: 4, weight: 1 },
    ],
    start: 0,
    end: 4,
  },
  {
    id: "multiple",
    name: "Nhiều Đường",
    description: "Dijkstra tìm ngắn nhất, DFS/BFS tìm dài hơn",
    nodes: [
      { id: 0, x: 150, y: 150 },
      { id: 1, x: 250, y: 100 },
      { id: 2, x: 250, y: 200 },
      { id: 3, x: 350, y: 150 },
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
  {
    id: "dense",
    name: "Đồ Thị Dày Đặc",
    description: "A* có thể hiệu quả hơn với heuristic",
    nodes: [
      { id: 0, x: 100, y: 100 },
      { id: 1, x: 200, y: 100 },
      { id: 2, x: 300, y: 100 },
      { id: 3, x: 100, y: 200 },
      { id: 4, x: 200, y: 200 },
      { id: 5, x: 300, y: 200 },
    ],
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 3, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 4, weight: 1 },
      { from: 2, to: 5, weight: 1 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 5, weight: 1 },
      { from: 0, to: 4, weight: 2 },
      { from: 1, to: 5, weight: 2 },
    ],
    start: 0,
    end: 5,
  },
  {
    id: "weighted",
    name: "Trọng Số Không Đều",
    description: "BFS bỏ qua trọng số, Dijkstra ưu tiên đúng",
    nodes: [
      { id: 0, x: 100, y: 150 },
      { id: 1, x: 250, y: 100 },
      { id: 2, x: 250, y: 200 },
      { id: 3, x: 400, y: 150 },
    ],
    edges: [
      { from: 0, to: 1, weight: 50 },
      { from: 0, to: 2, weight: 10 },
      { from: 1, to: 3, weight: 1 },
      { from: 2, to: 3, weight: 30 },
    ],
    start: 0,
    end: 3,
  },
  {
    id: "disconnected",
    name: "Đồ Thị Không Liên Thông",
    description: "Thử thách: không có đường từ start đến end",
    nodes: [
      { id: 0, x: 100, y: 150 },
      { id: 1, x: 200, y: 150 },
      { id: 2, x: 400, y: 150 },
      { id: 3, x: 500, y: 150 },
    ],
    edges: [
      { from: 0, to: 1, weight: 5 },
      { from: 2, to: 3, weight: 5 },
    ],
    start: 0,
    end: 3,
  },
  {
    id: "cycle",
    name: "Chu Trình",
    description: "Đồ thị có vòng lặp - các thuật toán xử lý như thế nào?",
    nodes: [
      { id: 0, x: 200, y: 100 },
      { id: 1, x: 300, y: 100 },
      { id: 2, x: 350, y: 200 },
      { id: 3, x: 250, y: 250 },
      { id: 4, x: 150, y: 200 },
    ],
    edges: [
      { from: 0, to: 1, weight: 2 },
      { from: 1, to: 2, weight: 3 },
      { from: 2, to: 3, weight: 2 },
      { from: 3, to: 4, weight: 3 },
      { from: 4, to: 0, weight: 2 },
      { from: 0, to: 3, weight: 8 },
    ],
    start: 0,
    end: 3,
  },
]

export default function ComparisonCustom() {
  const [selectedCase, setSelectedCase] = useState<TestCase>(testCases[0])
  const [results, setResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runComparison = () => {
    setIsRunning(true)

    // Xây dựng đồ thị
    const graph: { [key: number]: Array<[number, number]> } = {}
    selectedCase.nodes.forEach((n) => {
      graph[n.id] = []
    })

    selectedCase.edges.forEach((e) => {
      graph[e.from].push([e.to, e.weight])
      graph[e.to].push([e.from, e.weight])
    })

    // Chạy tất cả thuật toán
    const dijkstraResult = dijkstra(graph, selectedCase.start, selectedCase.end)
    const bfsResult = bfs(graph, selectedCase.start, selectedCase.end)
    const dfsResult = dfs(graph, selectedCase.start, selectedCase.end)
    const aStarResult = aStar(graph, selectedCase.start, selectedCase.end, selectedCase.nodes)

    setResults({
      dijkstra: dijkstraResult,
      bfs: bfsResult,
      dfs: dfsResult,
      aStar: aStarResult,
    })

    setTimeout(() => setIsRunning(false), 500)
  }

  const chartData = results
    ? [
        {
          name: "Dijkstra",
          visited: results.dijkstra.visited.size,
          time: results.dijkstra.time,
          distance: results.dijkstra.distance,
        },
        {
          name: "BFS",
          visited: results.bfs.visited.size,
          time: results.bfs.time,
          distance: results.bfs.distance,
        },
        {
          name: "DFS",
          visited: results.dfs.visited.size,
          time: results.dfs.time,
          distance: results.dfs.distance,
        },
        {
          name: "A*",
          visited: results.aStar.visited.size,
          time: results.aStar.time,
          distance: results.aStar.distance,
        },
      ]
    : []

  const radarData = chartData.map((item) => ({
    name: item.name,
    visited: item.visited,
    efficiency: item.visited > 0 ? Math.round((1 / item.visited) * 100) : 0,
    speed: Math.max(...chartData.map((d) => d.time)) - item.time + 1,
  }))

  return (
    <div className="space-y-6">
      {/* Test Case Selector */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Chọn Test Case</CardTitle>
          <CardDescription>So sánh hiệu suất của 4 thuật toán với các tình huống khác nhau</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testCases.map((tc) => (
              <Button
                key={tc.id}
                onClick={() => setSelectedCase(tc)}
                variant={selectedCase.id === tc.id ? "default" : "outline"}
                className={`justify-start h-auto p-3 text-left ${
                  selectedCase.id === tc.id
                    ? "bg-gradient-to-r from-primary to-primary/80 border-0"
                    : "border border-border/50 hover:bg-card/50"
                }`}
              >
                <div className="space-y-1">
                  <p className="font-semibold">{tc.name}</p>
                  <p className="text-xs opacity-70">{tc.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Run Button */}
      <Button
        onClick={runComparison}
        className="w-full h-12 text-lg bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-lg hover:shadow-secondary/30"
        disabled={isRunning}
      >
        {isRunning ? "Đang So Sánh..." : "Chạy So Sánh"}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chartData.map((data) => (
              <Card key={data.name} className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-base">{data.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nút Duyệt</p>
                    <p className="text-2xl font-bold text-primary">{data.visited}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Khoảng Cách</p>
                    <p className="text-2xl font-bold text-secondary">
                      {data.distance === Number.POSITIVE_INFINITY ? "∞" : data.distance.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Thời Gian</p>
                    <p className="text-lg font-bold text-accent">{data.time.toFixed(3)}ms</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Nodes Visited */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Số Nút Duyệt</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    />
                    <Bar dataKey="visited" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Time */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Thời Gian Thực Thi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    />
                    <Bar dataKey="time" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>So Sánh Hiệu Suất Toàn Cảnh</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="name" stroke="currentColor" />
                    <PolarRadiusAxis stroke="currentColor" />
                    <Radar
                      name="Nút Duyệt"
                      dataKey="visited"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Hiệu Suất"
                      dataKey="efficiency"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distance Comparison */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>So Sánh Khoảng Cách</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                    />
                    <Bar dataKey="distance" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          <Card className="glassmorphism border-primary/50 bg-primary/10">
            <CardHeader>
              <CardTitle className="text-primary">Phân Tích Nhược Điểm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Dijkstra</h4>
                <p className="text-sm text-muted-foreground">
                  ✓ Luôn tìm được đường ngắn nhất với đồ thị trọng số dương. ✗ Chậm hơn BFS trên đồ thị không trọng số.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-2">BFS</h4>
                <p className="text-sm text-muted-foreground">
                  ✓ Nhanh và tối ưu cho đồ thị không trọng số. ✗ Bỏ qua trọng số cạnh, không phù hợp với đồ thị có trọng
                  số.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">DFS</h4>
                <p className="text-sm text-muted-foreground">
                  ✓ Tiêu tốn ít bộ nhớ, tốt cho tìm kiếm sâu. ✗ Không đảm bảo đường ngắn nhất, dễ bị kẹt trong nhánh
                  dài.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">A*</h4>
                <p className="text-sm text-muted-foreground">
                  ✓ Cải thiện Dijkstra bằng heuristic, rất nhanh. ✗ Cần hàm heuristic tốt, phức tạp hơn Dijkstra.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Path Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <Card key={name} className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-base capitalize">{name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Đường Đi</p>
                    <p className="font-mono text-xs break-all">
                      {result.path.length > 0 ? result.path.join(" → ") : "Không tìm được"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Các Nút Duyệt</p>
                    <p className="font-mono text-xs break-all max-h-20 overflow-y-auto">
                      {Array.from(result.visited)
                        .sort((a, b) => a - b)
                        .join(", ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
