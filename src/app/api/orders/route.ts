import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateCheckinCode } from "@/lib/utils"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
      )
    }

    const { matchGroupId, roomId, totalAmount } = await request.json()

    if (!matchGroupId || !roomId || !totalAmount) {
      return NextResponse.json(
        { error: ErrorCodes.INVALID_PARAMS.message, code: ErrorCodes.INVALID_PARAMS.code },
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
      { error: ErrorCodes.ORDER_CREATE_FAILED.message, code: ErrorCodes.ORDER_CREATE_FAILED.code },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
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
      { error: ErrorCodes.ORDER_GET_FAILED.message, code: ErrorCodes.ORDER_GET_FAILED.code },
      { status: 500 }
    )
  }
}
