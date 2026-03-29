import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateVerificationCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { phone, type } = await request.json()

    if (!phone || !type) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (type === "register" && existingUser) {
      return NextResponse.json(
        { error: "该手机号已注册" },
        { status: 400 }
      )
    }

    if (type === "login" && !existingUser) {
      return NextResponse.json(
        { error: "该手机号未注册" },
        { status: 400 }
      )
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        type,
        expiresAt,
      },
    })

    console.log(`验证码已发送到 ${phone}: ${code}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("发送验证码失败:", error)
    return NextResponse.json(
      { error: "发送验证码失败" },
      { status: 500 }
    )
  }
}
