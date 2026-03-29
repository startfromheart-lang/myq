import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { phone, password, code } = await request.json()

    if (!phone || !password || !code) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该手机号已注册" },
        { status: 400 }
      )
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        type: "register",
        code,
        expiresAt: { gt: new Date() },
      },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        preferredMahjong: JSON.stringify([]),
        personalityTags: JSON.stringify([]),
      },
    })

    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("注册失败:", error)
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    )
  }
}
