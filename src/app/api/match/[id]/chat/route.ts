import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return createErrorResponse(ErrorCode.AUTH_LOGIN_REQUIRED)
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return createErrorResponse(ErrorCode.CHAT_CONTENT_EMPTY)
    }

    const participant = await prisma.matchGroupParticipant.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return createErrorResponse(ErrorCode.CHAT_NOT_PARTICIPANT)
    }

    const message = await prisma.chatMessage.create({
      data: {
        groupId: params.id,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            mphone: true,
            avatar: true,
            realName: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("发送消息失败:", error)
    return createErrorResponse(ErrorCode.CHAT_SEND_FAILED)
  }
}
