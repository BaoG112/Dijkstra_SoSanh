"use client"

import { Card } from "@/components/ui/card"

type TestCase = {
  id: string
  name: string
  nodes: number[][]
  edges: [number, number, number][]
  start: number
  end: number
  description: string
}

interface TestCasesProps {
  selectedCase: TestCase | null
  onSelectCase: (testCase: TestCase) => void
  onAnimatingChange: (animating: boolean) => void
}

// Test cases showing different graph scenarios and algorithm weaknesses
const TEST_CASES: TestCase[] = [
  {
    id: "simple",
    name: "Simple Linear Graph",
    nodes: [
      [50, 200],
      [150, 200],
      [250, 200],
      [350, 200],
      [450, 200],
    ],
    edges: [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [3, 4, 1],
    ],
    start: 0,
    end: 4,
    description: "Linear graph to demonstrate basic pathfinding. All algorithms find the same path.",
  },
  {
    id: "multiple-paths",
    name: "Multiple Paths (Dijkstra Advantage)",
    nodes: [
      [100, 100],
      [100, 300],
      [300, 100],
      [300, 300],
      [500, 200],
    ],
    edges: [
      [0, 1, 5],
      [0, 2, 1],
      [1, 3, 1],
      [2, 3, 5],
      [2, 4, 1],
      [3, 4, 1],
    ],
    start: 0,
    end: 4,
    description:
      "Multiple paths exist. Dijkstra finds the truly shortest path (0→2→4). DFS/BFS may find longer paths due to exploration order.",
  },
  {
    id: "dense-graph",
    name: "Dense Graph (A* Advantage)",
    nodes: [
      [50, 50],
      [150, 50],
      [250, 50],
      [50, 150],
      [150, 150],
      [250, 150],
      [50, 250],
      [150, 250],
      [250, 250],
      [450, 150],
    ],
    edges: [
      [0, 1, 1],
      [0, 3, 1],
      [1, 0, 1],
      [1, 2, 1],
      [1, 4, 1],
      [2, 1, 1],
      [2, 5, 1],
      [3, 0, 1],
      [3, 4, 1],
      [3, 6, 1],
      [4, 1, 1],
      [4, 3, 1],
      [4, 5, 1],
      [4, 7, 1],
      [5, 2, 1],
      [5, 4, 1],
      [5, 8, 1],
      [6, 3, 1],
      [6, 7, 1],
      [7, 4, 1],
      [7, 6, 1],
      [7, 8, 1],
      [8, 5, 1],
      [8, 7, 1],
      [8, 9, 1],
      [9, 8, 1],
    ],
    start: 0,
    end: 9,
    description:
      "Dense grid graph. A* uses heuristic to explore fewer nodes than Dijkstra. DFS/BFS explore many unnecessary nodes.",
  },
  {
    id: "no-path",
    name: "Disconnected Graph (No Path)",
    nodes: [
      [100, 100],
      [150, 100],
      [200, 100],
      [350, 100],
      [400, 100],
      [450, 100],
    ],
    edges: [
      [0, 1, 1],
      [1, 2, 1],
      [3, 4, 1],
      [4, 5, 1],
    ],
    start: 0,
    end: 5,
    description:
      "Two disconnected components. No algorithm can find a path. Shows how algorithms handle impossible cases.",
  },
  {
    id: "weighted",
    name: "Heavily Weighted Graph",
    nodes: [
      [100, 150],
      [200, 100],
      [200, 200],
      [300, 150],
      [400, 150],
    ],
    edges: [
      [0, 1, 1],
      [0, 2, 100],
      [1, 3, 50],
      [2, 3, 1],
      [3, 4, 1],
    ],
    start: 0,
    end: 4,
    description:
      "Heavy weights differ path preferences. Dijkstra: 0→1→3→4 (52). BFS/DFS may pick: 0→2→3→4 (102) due to ignoring weights.",
  },
  {
    id: "long-chain",
    name: "Long Chain (Memory & Time)",
    nodes: [
      [50, 200],
      [100, 200],
      [150, 200],
      [200, 200],
      [250, 200],
      [300, 200],
      [350, 200],
      [400, 200],
      [450, 200],
      [500, 200],
    ],
    edges: [
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [3, 4, 1],
      [4, 5, 1],
      [5, 6, 1],
      [6, 7, 1],
      [7, 8, 1],
      [8, 9, 1],
    ],
    start: 0,
    end: 9,
    description: "Long linear path. Shows how algorithm performance scales with graph size. All find same path.",
  },
]

export default function TestCases({ selectedCase, onSelectCase, onAnimatingChange }: TestCasesProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
          <p className="text-sm text-muted-foreground">
            Choose scenarios to highlight algorithm strengths & weaknesses
          </p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {TEST_CASES.map((testCase) => (
            <button
              key={testCase.id}
              onClick={() => {
                onSelectCase(testCase)
                onAnimatingChange(false)
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedCase?.id === testCase.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-foreground text-sm">{testCase.name}</h3>
                <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded">
                  {testCase.nodes.length} nodes
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{testCase.description}</p>
            </button>
          ))}
        </div>

        {/* Quick stats */}
        {selectedCase && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">Nodes</span>
                <span className="font-semibold text-foreground">{selectedCase.nodes.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Edges</span>
                <span className="font-semibold text-foreground">{selectedCase.edges.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Start → End</span>
                <span className="font-semibold text-foreground">
                  {selectedCase.start} → {selectedCase.end}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm notes */}
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/30 text-xs text-muted-foreground">
          <p className="font-semibold text-accent mb-2">Why Dijkstra vs Others?</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Dijkstra:</strong> Always finds shortest weighted path, but explores all directions equally
            </li>
            <li>
              <strong>A*:</strong> Faster, uses heuristic to guide toward goal, requires distance heuristic
            </li>
            <li>
              <strong>BFS/DFS:</strong> Ignore edge weights, good for unweighted graphs or finding any path
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
