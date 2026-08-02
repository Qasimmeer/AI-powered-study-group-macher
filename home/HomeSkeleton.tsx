import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";

export default function HomeSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
              <div className="h-6 w-96 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-12 w-40 bg-muted animate-pulse rounded-lg" />
          </header>

          {/* Stats Dashboard */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </section>

          {/* AI Card */}
          <div className="h-48 w-full bg-muted animate-pulse rounded-xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="space-y-6">
              <div className="h-8 w-40 bg-muted animate-pulse rounded" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            </section>
            <section className="space-y-6">
              <div className="h-8 w-40 bg-muted animate-pulse rounded" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
