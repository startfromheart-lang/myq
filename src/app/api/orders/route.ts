import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateCheckinCode } from "@/lib/utils"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return createErrorResponse(ErrorCode.AUTH_LOGIN_REQUIRED)
    }

    const { matchGroupId, roomId, totalAmount } = await request.json()

    if (!matchGroupId || !roomId || !totalAmount) {
      return createErrorResponse(ErrorCode.AUTH_MISSING_PARAMS)
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
    return createErrorResponse(ErrorCode.ORDER_CREATE_FAILED)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return createErrorResponse(ErrorCode.AUTH_LOGIN_REQUIRED)
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
                    mphone: true,
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
    return createErrorResponse(ErrorCode.ORDER_LIST_FAILED)
  }
}
