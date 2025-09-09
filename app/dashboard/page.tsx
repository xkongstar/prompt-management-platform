import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptList } from "@/components/prompt-list"
import { SearchBar } from "@/components/search-bar"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">我的提示词</h1>
          <p className="text-muted-foreground">管理和使用您的 AI 提示词集合</p>
        </div>

        <div className="mb-6">
          <SearchBar initialSearch={searchParams.search} />
        </div>

        <PromptList searchQuery={searchParams.search} />
      </div>
    </div>
  )
}
