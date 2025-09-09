import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-balance">AI 提示词管理平台</h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            统一管理、快速搜索、一键使用您的 AI 提示词资产
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="text-lg px-8 py-3">
              开始使用
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>统一管理</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>将分散在各处的提示词集中管理，告别混乱的存储方式</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速搜索</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>通过标题、内容、标签快速找到需要的提示词</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>一键复制</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>点击即可复制提示词到剪贴板，提升工作效率</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
