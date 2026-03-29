import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, mphone } = await request.json()

    if (!inviteCode || !mphone) {
      return NextResponse.json(
        { error: ErrorCodes.INVALID_PARAMS.message, code: ErrorCodes.INVALID_PARAMS.code },
        { status: 400 }
      )
    }

    const merchant = await prisma.merchant.findFirst({
      where: {
        inviteCode,
        contactPhone: mphone,
        status: "approved",
      },
    })

    if (!merchant) {
      return NextResponse.json(
        { error: ErrorCodes.MERCHANT_LOGIN_FAILED.message, code: ErrorCodes.MERCHANT_LOGIN_FAILED.code },
        { status: 401 }
      )
    }

    return NextResponse.json({
      id: merchant.id,
      shopName: merchant.shopName,
    })
  } catch (error) {
    console.error("商家登录失败:", error)
    return NextResponse.json(
      { error: ErrorCodes.LOGIN_FAILED.message, code: ErrorCodes.LOGIN_FAILED.code },
      { status: 500 }
    )
  }
}
