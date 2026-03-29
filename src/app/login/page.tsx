"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "登录失败",
          description: "手机号或密码错误",
          variant: "destructive",
        })
      } else {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        router.push("/")
      }
    } catch {
      toast({
        title: "登录失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mobile-container flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">麻友圈</CardTitle>
          <p className="text-muted-foreground">登录您的账户</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">还没有账户？</span>
            <Link href="/register" className="text-primary ml-1">
              立即注册
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/merchant/login" className="text-muted-foreground">
              商家入口
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
