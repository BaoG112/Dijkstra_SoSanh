interface Node {
  id: number
  x: number
  y: number
}

type Graph = { [key: number]: Array<[number, number]> }

interface AlgorithmResult {
  visited: Set<number>
  path: number[]
  distance: number
  time: number
}

// Dijkstra's Algorithm - Greedy algorithm for shortest path with non-negative weights
export function dijkstra(graph: Graph, start: number, end: number): AlgorithmResult {
  const startTime = performance.now()
  const distances: { [key: number]: number } = {}
  const previous: { [key: number]: number | null } = {}
  const unvisited = new Set<number>()
  const visited = new Set<number>()

  // Initialize distances
  Object.keys(graph).forEach((node) => {
    const nodeId = Number.parseInt(node)
    distances[nodeId] = nodeId === start ? 0 : Number.POSITIVE_INFINITY
    previous[nodeId] = null
    unvisited.add(nodeId)
  })

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = -1
    let minDist = Number.POSITIVE_INFINITY

    unvisited.forEach((node) => {
      if (distances[node] < minDist) {
        minDist = distances[node]
        current = node
      }
    })

    if (current === -1 || distances[current] === Number.POSITIVE_INFINITY) break

    unvisited.delete(current)
    visited.add(current)

    if (current === end) break

    // Update distances for neighbors
    if (graph[current]) {
      graph[current].forEach(([neighbor, weight]) => {
        const newDist = distances[current] + weight
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist
          previous[neighbor] = current
        }
      })
    }
  }

  // Reconstruct path
  const path: number[] = []
  let current = end
  while (current !== null) {
    path.unshift(current)
    current = previous[current]
  }

  const endTime = performance.now()

  return {
    visited,
    path: path.length > 0 && path[0] === start ? path : [],
    distance: distances[end],
    time: endTime - startTime,
  }
}

// BFS - explores nodes level by level, unweighted shortest path
export function bfs(graph: Graph, start: number, end: number): AlgorithmResult {
  const startTime = performance.now()
  const visited = new Set<number>()
  const previous: { [key: number]: number | null } = {}
  const queue: number[] = [start]
  const distance = 0

  visited.add(start)
  previous[start] = null

  while (queue.length > 0) {
    const current = queue.shift()!

    if (current === end) break

    if (graph[current]) {
      graph[current].forEach(([neighbor]) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          previous[neighbor] = current
          queue.push(neighbor)
        }
      })
    }
  }

  // Reconstruct path
  const path: number[] = []
  let current = end
  while (current !== null) {
    path.unshift(current)
    current = previous[current]
  }

  const endTime = performance.now()

  return {
    visited,
    path: path.length > 0 && path[0] === start ? path : [],
    distance: path.length - 1,
    time: endTime - startTime,
  }
}

// DFS - explores as far as possible along each branch, shows backtracking behavior
export function dfs(graph: Graph, start: number, end: number): AlgorithmResult {
  const startTime = performance.now()
  const visited = new Set<number>()
  const previous: { [key: number]: number | null } = {}
  const stack: number[] = [start]
  let found = false

  previous[start] = null

  while (stack.length > 0) {
    const current = stack.pop()!

    if (!visited.has(current)) {
      visited.add(current)

      if (current === end) {
        found = true
        break
      }

      if (graph[current]) {
        // Reverse to maintain left-to-right exploration
        graph[current].reverse().forEach(([neighbor]) => {
          if (!visited.has(neighbor)) {
            previous[neighbor] = current
            stack.push(neighbor)
          }
        })
        graph[current].reverse()
      }
    }
  }

  // Reconstruct path
  const path: number[] = []
  let current = end
  while (current !== null) {
    path.unshift(current)
    current = previous[current]
  }

  const endTime = performance.now()

  return {
    visited,
    path: found && path.length > 0 && path[0] === start ? path : [],
    distance: path.length - 1,
    time: endTime - startTime,
  }
}

// A* Search - uses heuristic to guide search toward goal, faster than Dijkstra
export function aStar(graph: Graph, start: number, end: number, nodes: Node[]): AlgorithmResult {
  const startTime = performance.now()

  // Heuristic: Euclidean distance to end
  const heuristic = (node: number): number => {
    const current = nodes.find((n) => n.id === node)
    const target = nodes.find((n) => n.id === end)
    if (!current || !target) return 0
    const dx = current.x - target.x
    const dy = current.y - target.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const openSet = new Set<number>([start])
  const cameFrom: { [key: number]: number | null } = {}
  const gScore: { [key: number]: number } = {}
  const fScore: { [key: number]: number } = {}
  const visited = new Set<number>()

  Object.keys(graph).forEach((node) => {
    const nodeId = Number.parseInt(node)
    gScore[nodeId] = Number.POSITIVE_INFINITY
    fScore[nodeId] = Number.POSITIVE_INFINITY
  })

  gScore[start] = 0
  fScore[start] = heuristic(start)
  cameFrom[start] = null

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let current = -1
    let lowestF = Number.POSITIVE_INFINITY

    openSet.forEach((node) => {
      if (fScore[node] < lowestF) {
        lowestF = fScore[node]
        current = node
      }
    })

    if (current === end) break
    if (current === -1) break

    openSet.delete(current)
    visited.add(current)

    if (graph[current]) {
      graph[current].forEach(([neighbor, weight]) => {
        if (visited.has(neighbor)) return

        openSet.add(neighbor)

        const tentativeGScore = gScore[current] + weight
        if (tentativeGScore < gScore[neighbor]) {
          cameFrom[neighbor] = current
          gScore[neighbor] = tentativeGScore
          fScore[neighbor] = gScore[neighbor] + heuristic(neighbor)
        }
      })
    }
  }

  // Reconstruct path
  const path: number[] = []
  let current = end
  while (current !== null) {
    path.unshift(current)
    current = cameFrom[current]
  }

  const endTime = performance.now()

  return {
    visited,
    path: path.length > 0 && path[0] === start ? path : [],
    distance: gScore[end],
    time: endTime - startTime,
  }
}
