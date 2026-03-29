import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const { mahjongType, regionRange, scheduledTime, duration } = await request.json()

    if (!mahjongType || !regionRange) {
      return NextResponse.json(
        { error: "缺少必要参数" },
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
      { error: "创建匹配失败" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
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
      { error: "获取匹配列表失败" },
      { status: 500 }
    )
  }
}
