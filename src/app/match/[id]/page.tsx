"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Send, Users, MapPin, Clock, Check } from "lucide-react"

interface Participant {
  id: string
  status: string
  user: {
    id: string
    phone: string
    avatar: string | null
    realName: string | null
    skillScore: number
    integrityScore: number
  }
}

interface MatchGroup {
  id: string
  status: string
  mahjongType: string
  regionRange: string
  scheduledTime: string | null
  duration: number | null
  participants: Participant[]
  chatMessages: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      phone: string
      avatar: string | null
      realName: string | null
    }
  }[]
}

const mahjongTypeLabels: Record<string, string> = {
  qiaoma: "敲麻",
  chuanma: "川麻",
  hongzhong: "红中麻将",
  guangdong: "广东麻将",
  shanghai: "上海麻将",
}

const regionLabels: Record<string, string> = {
  pudong: "浦东新区",
  xuhui: "徐汇区",
  jingan: "静安区",
  huangpu: "黄浦区",
  changning: "长宁区",
  putuo: "普陀区",
}

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [matchGroup, setMatchGroup] = useState<MatchGroup | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatchGroup()
    const interval = setInterval(fetchMatchGroup, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  const fetchMatchGroup = async () => {
    try {
      const res = await fetch(`/api/match/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setMatchGroup(data)
      }
    } catch (error) {
      console.error("获取匹配详情失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    try {
      const res = await fetch(`/api/match/${params.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      })

      if (res.ok) {
        setMessage("")
        fetchMatchGroup()
      }
    } catch (error) {
      toast({
        title: "发送失败",
        variant: "destructive",
      })
    }
  }

  const joinMatch = async () => {
    try {
      const res = await fetch(`/api/match/${params.id}/join`, {
        method: "POST",
      })

      if (res.ok) {
        toast({ title: "已加入匹配" })
        fetchMatchGroup()
      } else {
        const data = await res.json()
        toast({
          title: "加入失败",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "加入失败",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  if (!matchGroup) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <p>匹配不存在</p>
      </div>
    )
  }

  return (
    <div className="mobile-container">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center gap-4">
          <Link href="/match">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">匹配详情</h1>
        </div>
      </header>

      <main className="p-4 pb-20">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <h3 className="font-medium">
                  {mahjongTypeLabels[matchGroup.mahjongType] || matchGroup.mahjongType}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {regionLabels[matchGroup.regionRange] || matchGroup.regionRange}
                </p>
                {matchGroup.scheduledTime && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(matchGroup.scheduledTime).toLocaleString("zh-CN")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  {matchGroup.status === "matching" ? "匹配中" : matchGroup.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              参与者 ({matchGroup.participants.length}/4)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matchGroup.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={p.user.avatar || undefined} />
                    <AvatarFallback>
                      {(p.user.realName || p.user.phone).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {p.user.realName || p.user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      技术 {p.user.skillScore.toFixed(1)} | 诚信 {p.user.integrityScore.toFixed(1)}
                    </p>
                  </div>
                  {p.status === "confirmed" && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
            {matchGroup.participants.length < 4 && matchGroup.status === "matching" && (
              <Button className="w-full mt-4" onClick={joinMatch}>
                加入匹配
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              群聊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto mb-4 space-y-3">
              {matchGroup.chatMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  暂无消息
                </p>
              ) : (
                matchGroup.chatMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={msg.sender.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {(msg.sender.realName || msg.sender.phone).slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {msg.sender.realName || msg.sender.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                      </p>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="输入消息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
