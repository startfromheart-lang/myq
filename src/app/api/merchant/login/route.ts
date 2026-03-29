import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, contactPhone } = await request.json()

    if (!inviteCode || !contactPhone) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    const merchant = await prisma.merchant.findFirst({
      where: {
        inviteCode,
        contactPhone,
        status: "approved",
      },
    })

    if (!merchant) {
      return NextResponse.json(
        { error: "邀请码或联系电话错误，或商家未通过审核" },
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
      { error: "登录失败" },
      { status: 500 }
    )
  }
}
