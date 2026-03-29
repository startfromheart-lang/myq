import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, Calendar, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="mobile-container">
      <header className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">麻友圈</h1>
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-primary/80">
              登录
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 pb-20">
        <section className="mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">找牌友，约麻将</h2>
            <p className="text-green-100 mb-4">快速匹配志同道合的麻友</p>
            <Link href="/match">
              <Button className="bg-white text-green-600 hover:bg-green-50">
                立即约麻
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-4">功能特色</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">智能匹配</h4>
                <p className="text-sm text-muted-foreground">根据偏好匹配牌友</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">附近麻将馆</h4>
                <p className="text-sm text-muted-foreground">发现周边优质场馆</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">预约订场</h4>
                <p className="text-sm text-muted-foreground">在线预订便捷省心</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">信用评价</h4>
                <p className="text-sm text-muted-foreground">真实评价保障体验</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-4">热门麻将馆</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">雀友汇麻将馆</h4>
                    <p className="text-sm text-muted-foreground">浦东新区张江路88号</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-sm text-muted-foreground">¥68/小时</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">欢乐麻将俱乐部</h4>
                    <p className="text-sm text-muted-foreground">徐汇区漕溪北路168号</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-500">★★★★☆</span>
                      <span className="text-sm text-muted-foreground">¥58/小时</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-primary">
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
          <Link href="/profile" className="flex flex-col items-center text-gray-500">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">我的</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
