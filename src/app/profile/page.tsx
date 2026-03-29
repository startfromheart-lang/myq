"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Users, Star, Settings, LogOut, User, Award } from "lucide-react"

interface UserProfile {
  id: string
  mphone: string
  realName: string | null
  avatar: string | null
  isVerified: boolean
  skillScore: number
  integrityScore: number
  preferredMahjong: string[]
  personalityTags: string[]
  selfEvaluation: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("获取用户信息失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast({ title: "已退出登录" })
    router.push("/login")
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <p>获取用户信息失败</p>
      </div>
    )
  }

  return (
    <div className="mobile-container">
      <header className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">我的</h1>
      </header>

      <main className="p-4 pb-20">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback className="text-xl">
                  {(profile.realName || profile.mphone).slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-medium">
                  {profile.realName || profile.mphone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.isVerified ? (
                    <span className="text-green-600">已实名认证</span>
                  ) : (
                    <span>未实名认证</span>
                  )}
                </p>
              </div>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm">
                  编辑
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">我的评分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{profile.skillScore.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">技术分</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{profile.integrityScore.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">诚信分</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {profile.preferredMahjong.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">麻将偏好</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.preferredMahjong.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.selfEvaluation && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">自我介绍</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{profile.selfEvaluation}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardContent className="p-0">
            <Link href="/profile/verify" className="flex items-center gap-4 p-4 border-b">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1">实名认证</span>
              <span className="text-sm text-muted-foreground">
                {profile.isVerified ? "已认证" : "未认证"}
              </span>
            </Link>
            <Link href="/profile/orders" className="flex items-center gap-4 p-4 border-b">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1">我的订单</span>
            </Link>
            <Link href="/profile/reviews" className="flex items-center gap-4 p-4 border-b">
              <Star className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1">我的评价</span>
            </Link>
            <Link href="/profile/settings" className="flex items-center gap-4 p-4 border-b">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1">设置</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-4 p-4 w-full text-left"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-red-500">退出登录</span>
            </button>
          </CardContent>
        </Card>
      </main>

      <nav className="bottom-nav">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link href="/match" className="flex flex-col items-center text-gray-500">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">约麻</span>
          </Link>
          <Link href="/rooms" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">麻将馆</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-primary">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
