import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { API_ERRORS, ERROR_MESSAGES } from "@/config/errors"

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, contactPhone: contactMphone } = await request.json()

    if (!inviteCode || !contactMphone) {
      return NextResponse.json(
        { error: API_ERRORS.MISSING_PARAMS.message },
        { status: API_ERRORS.MISSING_PARAMS.code }
      )
    }

    const merchant = await prisma.merchant.findFirst({
      where: {
        inviteCode,
        contactPhone: contactMphone,
        status: "approved",
      },
    })

    if (!merchant) {
      return NextResponse.json(
        { error: API_ERRORS.INVALID_INVITE_CODE.message },
        { status: API_ERRORS.INVALID_INVITE_CODE.code }
      )
    }

    return NextResponse.json({
      id: merchant.id,
      shopName: merchant.shopName,
    })
  } catch (error) {
    console.error("商家登录失败:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.LOGIN_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
