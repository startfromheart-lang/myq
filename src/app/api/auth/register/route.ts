import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { API_ERRORS, ERROR_MESSAGES } from "@/config/errors"

export async function POST(request: NextRequest) {
  try {
    const { mphone, password, code } = await request.json()

    if (!mphone || !password || !code) {
      return NextResponse.json(
        { error: API_ERRORS.MISSING_PARAMS.message },
        { status: API_ERRORS.MISSING_PARAMS.code }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: mphone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.PHONE_EXISTS },
        { status: API_ERRORS.PHONE_EXISTS.code }
      )
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
      return NextResponse.json(
        { error: API_ERRORS.INVALID_CODE.message },
        { status: API_ERRORS.INVALID_CODE.code }
      )
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
    return NextResponse.json(
      { error: ERROR_MESSAGES.REGISTER_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
