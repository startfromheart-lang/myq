import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { checkinCode } = await request.json()

    if (!checkinCode) {
      return NextResponse.json(
        { error: "请输入核销码" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: {
        checkinCode,
        paymentStatus: "paid",
        checkinTime: null,
      },
      include: {
        room: {
          include: {
            merchant: true,
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
    })

    if (!order) {
      return NextResponse.json(
        { error: "核销码无效或已使用" },
        { status: 404 }
      )
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { checkinTime: new Date() },
    })

    await prisma.matchGroup.update({
      where: { id: order.matchGroup.id },
      data: { status: "playing" },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        roomName: order.room.name,
        shopName: order.room.merchant.shopName,
        participants: order.matchGroup.participants.map((p) => ({
          name: p.user.realName || p.user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
        })),
      },
    })
  } catch (error) {
    console.error("核销失败:", error)
    return NextResponse.json(
      { error: "核销失败" },
      { status: 500 }
    )
  }
}
