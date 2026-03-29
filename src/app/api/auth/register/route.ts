import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { mphone, password, code } = await request.json()

    if (!mphone || !password || !code) {
      return createErrorResponse(ErrorCode.AUTH_MISSING_PARAMS)
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: mphone },
    })

    if (existingUser) {
      return createErrorResponse(ErrorCode.AUTH_PHONE_REGISTERED)
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone: mphone,
        type: "register",
        code,
        expiresAt: { gt: new Date() },
      },
    })

    if (!verificationCode) {
      return createErrorResponse(ErrorCode.AUTH_CODE_INVALID)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        phone: mphone,
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
    return createErrorResponse(ErrorCode.AUTH_REGISTER_FAILED)
  }
}
