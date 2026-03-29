"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Users, MapPin, Clock } from "lucide-react"

const mahjongTypes = [
  { value: "qiaoma", label: "敲麻" },
  { value: "chuanma", label: "川麻" },
  { value: "hongzhong", label: "红中麻将" },
  { value: "guangdong", label: "广东麻将" },
  { value: "shanghai", label: "上海麻将" },
]

const regions = [
  { value: "pudong", label: "浦东新区" },
  { value: "xuhui", label: "徐汇区" },
  { value: "jingan", label: "静安区" },
  { value: "huangpu", label: "黄浦区" },
  { value: "changning", label: "长宁区" },
  { value: "putuo", label: "普陀区" },
]

export default function MatchPage() {
  const [mahjongType, setMahjongType] = useState("")
  const [region, setRegion] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [duration, setDuration] = useState("2")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleMatch = async () => {
    if (!mahjongType || !region) {
      toast({
        title: "请选择麻将类型和区域",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mahjongType,
          regionRange: region,
          scheduledTime: scheduledTime || null,
          duration: parseInt(duration),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "匹配已创建",
          description: "正在为您寻找牌友...",
        })
        router.push(`/match/${data.groupId}`)
      } else {
        toast({
          title: "创建失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "创建失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mobile-container">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">约麻匹配</h1>
        </div>
      </header>

      <main className="p-4 pb-20">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              创建匹配
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>麻将类型</Label>
              <Select value={mahjongType} onValueChange={setMahjongType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择麻将类型" />
                </SelectTrigger>
                <SelectContent>
                  {mahjongTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>约麻区域</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="选择区域" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>约定时间（可选）</Label>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>时长</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2小时</SelectItem>
                  <SelectItem value="3">3小时</SelectItem>
                  <SelectItem value="4">4小时</SelectItem>
                  <SelectItem value="5">5小时</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleMatch}
              disabled={isLoading}
            >
              {isLoading ? "创建中..." : "开始匹配"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              我的匹配
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              暂无进行中的匹配
            </p>
          </CardContent>
        </Card>
      </main>

      <nav className="bottom-nav">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link href="/match" className="flex flex-col items-center text-primary">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">约麻</span>
          </Link>
          <Link href="/rooms" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">麻将馆</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-500">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
