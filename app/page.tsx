"use client"

import { useState } from "react"
import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DijkstraCustom from "@/components/dijkstra-custom"
import ComparisonCustom from "@/components/comparison-custom"

type TestCase = {
  id: string
  name: string
  nodes: number[][]
  edges: [number, number, number][]
  start: number
  end: number
  description: string
}

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="dijkstra" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger
              value="dijkstra"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
            >
              Thuật Toán Dijkstra
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20"
            >
              So Sánh Giải Thuật
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dijkstra" className="space-y-6">
            <DijkstraCustom />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparisonCustom />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
