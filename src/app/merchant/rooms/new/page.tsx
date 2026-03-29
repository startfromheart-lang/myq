"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

export default function NewRoomPage() {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [area, setArea] = useState("")
  const [price, setPrice] = useState("")
  const [mahjongSize, setMahjongSize] = useState("")
  const [maxTileCount, setMaxTileCount] = useState("4")
  const [hasToilet, setHasToilet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const merchantId = searchParams.get("merchantId")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!merchantId) {
      toast({
        title: "请先登录",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/merchant/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          name,
          address,
          area: parseFloat(area),
          price: parseFloat(price),
          mahjongSize,
          maxTileCount: parseInt(maxTileCount),
          hasToilet,
        }),
      })

      if (res.ok) {
        toast({ title: "房间添加成功" })
        router.push("/merchant/dashboard")
      } else {
        const data = await res.json()
        toast({
          title: "添加失败",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "添加失败",
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
          <Link href="/merchant/dashboard">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">添加房间</h1>
        </div>
      </header>

      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>房间信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">房间名称</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：豪华包间1号"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">详细地址</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="请输入详细地址"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">面积(m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">台费(元/小时)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="68"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>麻将大小</Label>
                <Select value={mahjongSize} onValueChange={setMahjongSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择麻将大小" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">小麻将</SelectItem>
                    <SelectItem value="medium">中麻将</SelectItem>
                    <SelectItem value="large">大麻将</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>最大章数</Label>
                <Select value={maxTileCount} onValueChange={setMaxTileCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4章</SelectItem>
                    <SelectItem value="8">8章</SelectItem>
                    <SelectItem value="12">12章</SelectItem>
                    <SelectItem value="16">16章</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasToilet"
                  checked={hasToilet}
                  onCheckedChange={(checked) => setHasToilet(checked as boolean)}
                />
                <Label htmlFor="hasToilet">有独立卫生间</Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "添加中..." : "添加房间"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
