import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
      )
    }

    const { mahjongType, regionRange, scheduledTime, duration } = await request.json()

    if (!mahjongType || !regionRange) {
      return NextResponse.json(
        { error: ErrorCodes.INVALID_PARAMS.message, code: ErrorCodes.INVALID_PARAMS.code },
        { status: 400 }
      )
    }

    const matchGroup = await prisma.matchGroup.create({
      data: {
        mahjongType,
        regionRange,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        duration,
        status: "matching",
        participants: {
          create: {
            userId: session.user.id,
            role: "member",
            status: "confirmed",
          },
        },
      },
    })

    return NextResponse.json({ groupId: matchGroup.id })
  } catch (error) {
    console.error("创建匹配失败:", error)
    return NextResponse.json(
      { error: ErrorCodes.MATCH_CREATE_FAILED.message, code: ErrorCodes.MATCH_CREATE_FAILED.code },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    }

    if (status) {
      where.status = status
    }

    const matchGroups = await prisma.matchGroup.findMany({
      where,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                avatar: true,
                realName: true,
                skillScore: true,
                integrityScore: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(matchGroups)
  } catch (error) {
    console.error("获取匹配列表失败:", error)
    return NextResponse.json(
      { error: ErrorCodes.MATCH_GET_FAILED.message, code: ErrorCodes.MATCH_GET_FAILED.code },
      { status: 500 }
    )
  }
}
