"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DijkstraInfoProps {
  result: {
    visited: number
    distance: number
    time: number
    path: number[]
  } | null
}

export default function DijkstraInfo({ result }: DijkstraInfoProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-base mb-4">Algorithm Details</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Dijkstra's algorithm finds the shortest path in weighted graphs with non-negative edge weights.
            </p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Nodes Visited</span>
            <Badge variant="outline">{result?.visited ?? "-"}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Path Distance</span>
            <Badge variant="outline">{result?.distance ?? "-"}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Execution Time</span>
            <Badge variant="outline">{result?.time.toFixed(3) ?? "-"} ms</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Path Length</span>
            <Badge variant="outline">{result?.path.length ?? "-"}</Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Characteristics</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>✓ Guarantees shortest path</li>
            <li>✓ Time complexity: O((V + E) log V)</li>
            <li>✓ Works with weighted edges</li>
            <li>✗ Cannot handle negative weights</li>
            <li>✗ Slower than BFS for unweighted graphs</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
