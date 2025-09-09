import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptForm } from "@/components/prompt-form"

interface EditPromptPageProps {
  params: { id: string }
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const prompt = await prisma.prompt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })

  if (!prompt) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">编辑提示词</h1>
          <p className="text-muted-foreground">修改您的提示词内容</p>
        </div>

        <div className="max-w-2xl">
          <PromptForm
            initialData={{
              id: prompt.id,
              title: prompt.title,
              content: prompt.content,
              tags: prompt.tags || "",
            }}
          />
        </div>
      </div>
    </div>
  )
}
