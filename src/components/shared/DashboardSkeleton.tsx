import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Big Header Card */}
      <Skeleton className="h-48 w-full rounded-xl" />
      
      {/* List Items */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}