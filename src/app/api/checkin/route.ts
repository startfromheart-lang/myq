import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const { checkinCode } = await request.json()

    if (!checkinCode) {
      return NextResponse.json(
        { error: ErrorCodes.CHECKIN_CODE_EMPTY.message, code: ErrorCodes.CHECKIN_CODE_EMPTY.code },
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
        { error: ErrorCodes.CHECKIN_CODE_INVALID.message, code: ErrorCodes.CHECKIN_CODE_INVALID.code },
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
      { error: ErrorCodes.CHECKIN_FAILED.message, code: ErrorCodes.CHECKIN_FAILED.code },
      { status: 500 }
    )
  }
}
