"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function MerchantLoginPage() {
  const [inviteCode, setInviteCode] = useState("")
  const [contactMphone, setContactMphone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, contactPhone: contactMphone }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        router.push("/merchant/dashboard")
      } else {
        toast({
          title: "登录失败",
          description: data.error || "请检查邀请码和联系电话",
          variant: "destructive",
        })
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
          <CardTitle className="text-2xl">商家登录</CardTitle>
          <p className="text-muted-foreground">麻友圈商家管理平台</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">邀请码</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="请输入商家邀请码"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactMphone">联系电话</Label>
              <Input
                id="contactMphone"
                type="tel"
                placeholder="请输入联系电话"
                value={contactMphone}
                onChange={(e) => setContactMphone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-muted-foreground">
              返回用户登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
