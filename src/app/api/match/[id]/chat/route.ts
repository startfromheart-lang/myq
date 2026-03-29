import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
      )
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: ErrorCodes.CHAT_MESSAGE_EMPTY.message, code: ErrorCodes.CHAT_MESSAGE_EMPTY.code },
        { status: 400 }
      )
    }

    const participant = await prisma.matchGroupParticipant.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: ErrorCodes.NOT_MATCH_PARTICIPANT.message, code: ErrorCodes.NOT_MATCH_PARTICIPANT.code },
        { status: 403 }
      )
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
            phone: true,
            avatar: true,
            realName: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("发送消息失败:", error)
    return NextResponse.json(
      { error: ErrorCodes.CHAT_SEND_FAILED.message, code: ErrorCodes.CHAT_SEND_FAILED.code },
      { status: 500 }
    )
  }
}
