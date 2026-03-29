import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateVerificationCode } from "@/lib/utils"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { mphone, type } = await request.json()

    if (!mphone || !type) {
      return createErrorResponse(ErrorCode.AUTH_MISSING_PARAMS)
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: mphone },
    })

    if (type === "register" && existingUser) {
      return createErrorResponse(ErrorCode.AUTH_PHONE_REGISTERED)
    }

    if (type === "login" && !existingUser) {
      return createErrorResponse(ErrorCode.AUTH_PHONE_NOT_REGISTERED)
    }

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.verificationCode.create({
      data: {
        phone: mphone,
        code,
        type,
        expiresAt,
      },
    })

    console.log(`验证码已发送到 ${mphone}: ${code}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("发送验证码失败:", error)
    return createErrorResponse(ErrorCode.AUTH_SEND_CODE_FAILED)
  }
}
