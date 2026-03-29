import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return createErrorResponse(ErrorCode.AUTH_LOGIN_REQUIRED)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        mphone: true,
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
      return createErrorResponse(ErrorCode.USER_NOT_FOUND)
    }

    return NextResponse.json({
      ...user,
      preferredMahjong: JSON.parse(user.preferredMahjong || "[]"),
      personalityTags: JSON.parse(user.personalityTags || "[]"),
    })
  } catch (error) {
    console.error("获取用户信息失败:", error)
    return createErrorResponse(ErrorCode.USER_GET_FAILED)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return createErrorResponse(ErrorCode.AUTH_LOGIN_REQUIRED)
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
    return createErrorResponse(ErrorCode.USER_UPDATE_FAILED)
  }
}
