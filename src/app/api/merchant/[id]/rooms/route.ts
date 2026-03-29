import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rooms = await prisma.mahjongRoom.findMany({
      where: {
        merchantId: params.id,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("获取房间列表失败:", error)
    return createErrorResponse(ErrorCode.ROOM_LIST_FAILED)
  }
}
