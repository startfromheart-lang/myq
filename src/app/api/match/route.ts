import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { API_ERRORS, ERROR_MESSAGES } from "@/config/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
      )
    }

    const { mahjongType, regionRange, scheduledTime, duration } = await request.json()

    if (!mahjongType || !regionRange) {
      return NextResponse.json(
        { error: API_ERRORS.MISSING_PARAMS.message },
        { status: API_ERRORS.MISSING_PARAMS.code }
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
      { error: ERROR_MESSAGES.CREATE_MATCH_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
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

    const transformedMatchGroups = matchGroups.map((group) => ({
      ...group,
      participants: group.participants.map((participant) => ({
        ...participant,
        user: {
          ...participant.user,
          mphone: participant.user?.phone,
          phone: undefined,
        },
      })),
    }))

    return NextResponse.json(transformedMatchGroups)
  } catch (error) {
    console.error("获取匹配列表失败:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.GET_MATCH_LIST_FAILED },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
