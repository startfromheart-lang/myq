import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { API_ERRORS } from "@/config/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        room: {
          merchantId: params.id,
        },
      },
      include: {
        room: {
          select: {
            name: true,
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
      take: 50,
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
