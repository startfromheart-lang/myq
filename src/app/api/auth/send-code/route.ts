import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationCode } from "@/lib/utils"
import { API_ERRORS, ERROR_MESSAGES } from "@/config/errors"

export async function POST(request: NextRequest) {
  try {
    const { mphone, type } = await request.json()

    if (!mphone || !type) {
      return NextResponse.json(
        { error: API_ERRORS.MISSING_PARAMS.message },
        { status: API_ERRORS.MISSING_PARAMS.code }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: mphone },
    })

    if (type === "register" && existingUser) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PHONE_EXISTS },
        { status: API_ERRORS.PHONE_EXISTS.code }
      )
    }

    if (type === "login" && !existingUser) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PHONE_NOT_REGISTERED },
        { status: API_ERRORS.PHONE_NOT_REGISTERED.code }
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
      { error: ERROR_MESSAGES.SEND_CODE_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
