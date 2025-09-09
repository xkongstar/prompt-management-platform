import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { PromptCard } from "@/components/prompt-card"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface PromptListProps {
  searchQuery?: string
}

export async function PromptList({ searchQuery }: PromptListProps) {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const whereClause: any = {
    userId: session.user.id,
  }

  // Add search functionality if search query is provided
  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
      { tags: { contains: searchQuery, mode: "insensitive" } },
    ]
  }

  const prompts = await prisma.prompt.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{searchQuery ? "未找到匹配的提示词" : "还没有提示词"}</h3>
          <p className="text-muted-foreground text-center">
            {searchQuery
              ? "尝试使用不同的关键词搜索，或者创建一个新的提示词"
              : "开始创建您的第一个提示词来管理您的 AI 工作流"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}
