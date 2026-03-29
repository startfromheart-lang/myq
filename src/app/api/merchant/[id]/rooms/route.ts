import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

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
    return NextResponse.json(
      { error: ErrorCodes.MERCHANT_ROOM_GET_FAILED.message, code: ErrorCodes.MERCHANT_ROOM_GET_FAILED.code },
      { status: 500 }
    )
  }
}
