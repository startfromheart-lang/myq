import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { API_ERRORS, ERROR_MESSAGES } from "@/config/errors"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phone: true,
        realName: true,
        avatar: true,
        isVerified: true,
        skillScore: true,
        integrityScore: true,
        preferredMahjong: true,
        personalityTags: true,
        selfEvaluation: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_FOUND.message },
        { status: API_ERRORS.USER_NOT_FOUND.code }
      )
    }

    return NextResponse.json({
      ...user,
      mphone: user.phone,
      phone: undefined,
      preferredMahjong: JSON.parse(user.preferredMahjong || "[]"),
      personalityTags: JSON.parse(user.personalityTags || "[]"),
    })
  } catch (error) {
    console.error("获取用户信息失败:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.GET_USER_PROFILE_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
      )
    }

    const data = await request.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        realName: data.realName,
        avatar: data.avatar,
        preferredMahjong: JSON.stringify(data.preferredMahjong || []),
        personalityTags: JSON.stringify(data.personalityTags || []),
        selfEvaluation: data.selfEvaluation,
        job: data.job,
        gender: data.gender,
        city: data.city,
      },
    })

    return NextResponse.json({
      ...user,
      mphone: user.phone,
      phone: undefined,
      preferredMahjong: JSON.parse(user.preferredMahjong || "[]"),
      personalityTags: JSON.parse(user.personalityTags || "[]"),
    })
  } catch (error) {
    console.error("更新用户信息失败:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.UPDATE_USER_PROFILE_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
