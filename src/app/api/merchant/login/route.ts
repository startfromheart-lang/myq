import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, mphone } = await request.json()

    if (!inviteCode || !mphone) {
      return createErrorResponse(ErrorCode.AUTH_MISSING_PARAMS)
    }

    const merchant = await prisma.merchant.findFirst({
      where: {
        inviteCode,
        contactPhone: mphone,
        status: "approved",
      },
    })

    if (!merchant) {
      return createErrorResponse(ErrorCode.MERCHANT_INVALID_CREDENTIALS)
    }

    return NextResponse.json({
      id: merchant.id,
      shopName: merchant.shopName,
    })
  } catch (error) {
    console.error("商家登录失败:", error)
    return createErrorResponse(ErrorCode.MERCHANT_LOGIN_FAILED)
  }
}
