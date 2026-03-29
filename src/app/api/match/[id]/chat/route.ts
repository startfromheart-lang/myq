import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
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

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "消息内容不能为空" },
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
        { error: "您不是该匹配的参与者" },
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
      { error: "发送消息失败" },
      { status: 500 }
    )
  }
}
