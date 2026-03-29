import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { API_ERRORS } from "@/config/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: API_ERRORS.USER_NOT_LOGIN.message },
        { status: API_ERRORS.USER_NOT_LOGIN.code }
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
        { status: API_ERRORS.USER_NOT_FOUND.code }
      )
    }

    const transformedMatchGroup = {
      ...matchGroup,
      participants: matchGroup.participants.map((participant) => ({
        ...participant,
        user: {
          ...participant.user,
          mphone: participant.user?.phone,
          phone: undefined,
        },
      })),
      chatMessages: matchGroup.chatMessages.map((message) => ({
        ...message,
        sender: {
          ...message.sender,
          mphone: message.sender?.phone,
          phone: undefined,
        },
      })),
    }

    return NextResponse.json(transformedMatchGroup)
  } catch (error) {
    console.error("获取匹配详情失败:", error)
    return NextResponse.json(
      { error: "获取匹配详情失败" },
      { status: API_ERRORS.INTERNAL_ERROR.code }
    )
  }
}
