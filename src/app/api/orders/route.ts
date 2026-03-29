import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateCheckinCode } from "@/lib/utils"
import { API_ERRORS } from "@/config/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
      )
    }

    const { matchGroupId, roomId, totalAmount } = await request.json()

    if (!matchGroupId || !roomId || !totalAmount) {
      return NextResponse.json(
        { error: API_ERRORS.MISSING_PARAMS.message },
        { status: API_ERRORS.MISSING_PARAMS.code }
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
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
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

    const transformedOrders = orders.map((order) => ({
      ...order,
      matchGroup: {
        ...order.matchGroup,
        participants: order.matchGroup.participants.map((participant) => ({
          ...participant,
          user: {
            ...participant.user,
            mphone: participant.user?.phone,
            phone: undefined,
          },
        })),
      },
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error("获取订单列表失败:", error)
    return NextResponse.json(
      { error: "获取订单列表失败" },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
