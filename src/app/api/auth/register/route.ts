import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const { mphone, password, code } = await request.json()

    if (!mphone || !password || !code) {
      return NextResponse.json(
        { error: ErrorCodes.INVALID_PARAMS.message, code: ErrorCodes.INVALID_PARAMS.code },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: mphone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: ErrorCodes.PHONE_ALREADY_REGISTERED.message, code: ErrorCodes.PHONE_ALREADY_REGISTERED.code },
        { status: 400 }
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
        { error: ErrorCodes.INVALID_VERIFICATION_CODE.message, code: ErrorCodes.INVALID_VERIFICATION_CODE.code },
        { status: 400 }
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
      { error: ErrorCodes.REGISTER_FAILED.message, code: ErrorCodes.REGISTER_FAILED.code },
      { status: 500 }
    )
  }
}
