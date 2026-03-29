import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
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
        { error: ErrorCodes.USER_NOT_FOUND.message, code: ErrorCodes.USER_NOT_FOUND.code },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...user,
      preferredMahjong: JSON.parse(user.preferredMahjong || "[]"),
      personalityTags: JSON.parse(user.personalityTags || "[]"),
    })
  } catch (error) {
    console.error("获取用户信息失败:", error)
    return NextResponse.json(
      { error: ErrorCodes.USER_PROFILE_GET_FAILED.message, code: ErrorCodes.USER_PROFILE_GET_FAILED.code },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
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
      preferredMahjong: JSON.parse(user.preferredMahjong || "[]"),
      personalityTags: JSON.parse(user.personalityTags || "[]"),
    })
  } catch (error) {
    console.error("更新用户信息失败:", error)
    return NextResponse.json(
      { error: ErrorCodes.USER_UPDATE_FAILED.message, code: ErrorCodes.USER_UPDATE_FAILED.code },
      { status: 500 }
    )
  }
}
