import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptForm } from "@/components/prompt-form"

export default async function NewPromptPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">创建新提示词</h1>
          <p className="text-muted-foreground">添加一个新的 AI 提示词到您的集合中</p>
        </div>

        <div className="max-w-2xl">
          <PromptForm />
        </div>
      </div>
    </div>
  )
}
