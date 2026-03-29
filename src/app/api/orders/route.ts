import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateCheckinCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const { matchGroupId, roomId, totalAmount } = await request.json()

    if (!matchGroupId || !roomId || !totalAmount) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    const checkinCode = generateCheckinCode()

    const order = await prisma.order.create({
      data: {
        matchGroupId,
        roomId,
        totalAmount,
        paymentStatus: "pending",
        checkinCode,
      },
    })

    await prisma.matchGroup.update({
      where: { id: matchGroupId },
      data: { roomId },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("创建订单失败:", error)
    return NextResponse.json(
      { error: "创建订单失败" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        matchGroup: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        room: {
          include: {
            merchant: {
              select: {
                shopName: true,
              },
            },
          },
        },
        matchGroup: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    phone: true,
                    realName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("获取订单列表失败:", error)
    return NextResponse.json(
      { error: "获取订单列表失败" },
      { status: 500 }
    )
  }
}
