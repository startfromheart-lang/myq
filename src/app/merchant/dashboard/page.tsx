"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Users, MapPin, DollarSign, Calendar, Plus, Settings } from "lucide-react"

interface MerchantInfo {
  id: string
  shopName: string
  contactMphone: string
  status: string
}

interface Room {
  id: string
  name: string
  price: number
  status: string
  orders: { id: string }[]
}

interface Order {
  id: string
  totalAmount: number
  paymentStatus: string
  checkinTime: string | null
  createdAt: string
  room: {
    name: string
  }
  matchGroup: {
    participants: {
      user: {
        mphone: string
        realName: string | null
      }
    }[]
  }[]
}

export default function MerchantDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const merchantData = sessionStorage.getItem("merchant")
    if (!merchantData) {
      router.push("/merchant/login")
      return
    }
    setMerchant(JSON.parse(merchantData))
    fetchData(JSON.parse(merchantData).id)
  }, [router])

  const fetchData = async (merchantId: string) => {
    try {
      const [roomsRes, ordersRes] = await Promise.all([
        fetch(`/api/merchant/${merchantId}/rooms`),
        fetch(`/api/merchant/${merchantId}/orders`),
      ])

      if (roomsRes.ok) {
        setRooms(await roomsRes.json())
      }
      if (ordersRes.ok) {
        setOrders(await ordersRes.json())
      }
    } catch (error) {
      console.error("获取数据失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("merchant")
    router.push("/merchant/login")
  }

  if (isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  if (!merchant) {
    return null
  }

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
  )
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((acc, o) => acc + o.totalAmount, 0)

  return (
    <div className="mobile-container">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{merchant.shopName}</h1>
              <p className="text-sm text-green-100">商家管理后台</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white" onClick={handleLogout}>
            退出
          </Button>
        </div>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">¥{todayRevenue.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">今日收入</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{todayOrders.length}</p>
              <p className="text-sm text-muted-foreground">今日订单</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms">
          <TabsList className="w-full">
            <TabsTrigger value="rooms" className="flex-1">
              房间管理
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">
              订单管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">我的房间</h3>
              <Link href="/merchant/rooms/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  添加房间
                </Button>
              </Link>
            </div>
            {rooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                暂无房间，请添加
              </p>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{room.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ¥{room.price}/小时
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              room.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {room.status === "active" ? "营业中" : "已下架"}
                          </span>
                          <Link href={`/merchant/rooms/${room.id}`}>
                            <Button variant="outline" size="sm">
                              管理
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <h3 className="font-medium mb-4">订单列表</h3>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                暂无订单
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{order.room.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("zh-CN")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            核销码: {order.checkinTime ? "已核销" : "待核销"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">¥{order.totalAmount}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "已支付" : "待支付"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
