import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateVerificationCode } from "@/lib/utils"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const { mphone, type } = await request.json()

    if (!mphone || !type) {
      return NextResponse.json(
        { error: ErrorCodes.INVALID_PARAMS.message, code: ErrorCodes.INVALID_PARAMS.code },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: mphone },
    })

    if (type === "register" && existingUser) {
      return NextResponse.json(
        { error: ErrorCodes.PHONE_ALREADY_REGISTERED.message, code: ErrorCodes.PHONE_ALREADY_REGISTERED.code },
        { status: 400 }
      )
    }

    if (type === "login" && !existingUser) {
      return NextResponse.json(
        { error: ErrorCodes.PHONE_NOT_REGISTERED.message, code: ErrorCodes.PHONE_NOT_REGISTERED.code },
        { status: 400 }
      )
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
    return NextResponse.json(
      { error: ErrorCodes.SEND_CODE_FAILED.message, code: ErrorCodes.SEND_CODE_FAILED.code },
      { status: 500 }
    )
  }
}
