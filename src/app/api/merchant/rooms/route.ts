import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const room = await prisma.mahjongRoom.create({
      data: {
        merchantId: data.merchantId,
        name: data.name,
        address: data.address,
        area: data.area,
        price: data.price,
        mahjongSize: data.mahjongSize,
        maxTileCount: data.maxTileCount,
        hasToilet: data.hasToilet,
        images: [],
        status: "active",
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("添加房间失败:", error)
    return createErrorResponse(ErrorCode.ROOM_ADD_FAILED)
  }
}
