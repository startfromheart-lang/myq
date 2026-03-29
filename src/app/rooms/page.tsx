"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Room {
  id: string
  name: string
  address: string
  price: number
  area: number
  hasToilet: boolean
  images: string[]
  merchant: {
    shopName: string
  }
  shopReviews: {
    environmentScore: number
    serviceScore: number
    cateringScore: number
  }[]
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("default")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [sortBy])

  const fetchRooms = async () => {
    try {
      const res = await fetch(`/api/rooms?sortBy=${sortBy}`)
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (error) {
      console.error("获取麻将馆列表失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAverageRating = (room: Room) => {
    if (room.shopReviews.length === 0) return 0
    const total = room.shopReviews.reduce(
      (acc, r) => acc + (r.environmentScore + r.serviceScore + r.cateringScore) / 3,
      0
    )
    return total / room.shopReviews.length
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.includes(searchQuery) ||
      room.address.includes(searchQuery) ||
      room.merchant.shopName.includes(searchQuery)
  )

  return (
    <div className="mobile-container">
      <header className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold mb-4">麻将馆</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索麻将馆"
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-24 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认</SelectItem>
              <SelectItem value="price">价格</SelectItem>
              <SelectItem value="rating">评分</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="p-4 pb-20">
        {isLoading ? (
          <p className="text-center py-8">加载中...</p>
        ) : filteredRooms.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">暂无麻将馆</p>
        ) : (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {room.images[0] ? (
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <MapPin className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{room.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {room.merchant.shopName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {room.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-500 text-sm">
                            ★ {getAverageRating(room).toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {room.area}m²
                          </span>
                          {room.hasToilet && (
                            <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                              有卫生间
                            </span>
                          )}
                        </div>
                        <p className="text-primary font-medium mt-1">
                          {formatPrice(room.price)}/小时
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link href="/match" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">约麻</span>
          </Link>
          <Link href="/rooms" className="flex flex-col items-center text-primary">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">麻将馆</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-500">
            <MapPin className="w-6 h-6" />
            <span className="text-xs mt-1">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
