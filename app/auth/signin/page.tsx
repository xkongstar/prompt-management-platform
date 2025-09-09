"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AI 提示词管理平台</CardTitle>
          <CardDescription>使用 GitHub 账号登录，开始管理您的 AI 提示词</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full" 
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            使用 GitHub 登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
