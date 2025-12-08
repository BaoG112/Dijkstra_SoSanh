export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-card via-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Trực Quan Hóa Dijkstra</h1>
          <p className="text-muted-foreground text-lg">
            Khám phá cách hoạt động của thuật toán tìm đường đi ngắn nhất và so sánh hiệu suất với các giải thuật khác
          </p>
        </div>
      </div>
    </header>
  )
}
