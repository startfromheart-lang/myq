import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const matchGroup = await prisma.matchGroup.findUnique({
      where: { id: params.id },
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
        chatMessages: {
          include: {
            sender: {
              select: {
                id: true,
                phone: true,
                avatar: true,
                realName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!matchGroup) {
      return NextResponse.json(
        { error: "匹配不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(matchGroup)
  } catch (error) {
    console.error("获取匹配详情失败:", error)
    return NextResponse.json(
      { error: "获取匹配详情失败" },
      { status: 500 }
    )
  }
}
