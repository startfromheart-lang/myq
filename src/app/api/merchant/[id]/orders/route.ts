import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

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
      take: 50,
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("获取订单列表失败:", error)
    return createErrorResponse(ErrorCode.ORDER_LIST_FAILED)
  }
}
