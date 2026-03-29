import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "default"

    let orderBy: any = { createdAt: "desc" }

    if (sortBy === "price") {
      orderBy = { price: "asc" }
    }

    const rooms = await prisma.mahjongRoom.findMany({
      where: {
        status: "active",
      },
      include: {
        merchant: {
          select: {
            shopName: true,
          },
        },
        shopReviews: {
          select: {
            environmentScore: true,
            serviceScore: true,
            cateringScore: true,
          },
        },
      },
      orderBy,
    })

    const parsedRooms = rooms.map((room) => ({
      ...room,
      images: JSON.parse(room.images || "[]"),
    }))

    if (sortBy === "rating") {
      parsedRooms.sort((a, b) => {
        const avgA = a.shopReviews.length > 0
          ? a.shopReviews.reduce((acc, r) => acc + (r.environmentScore + r.serviceScore + r.cateringScore) / 3, 0) / a.shopReviews.length
          : 0
        const avgB = b.shopReviews.length > 0
          ? b.shopReviews.reduce((acc, r) => acc + (r.environmentScore + r.serviceScore + r.cateringScore) / 3, 0) / b.shopReviews.length
          : 0
        return avgB - avgA
      })
    }

    return NextResponse.json(parsedRooms)
  } catch (error) {
    console.error("获取麻将馆列表失败:", error)
    return NextResponse.json(
      { error: "获取麻将馆列表失败" },
      { status: 500 }
    )
  }
}
