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

    const matchGroup = await prisma.matchGroup.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    })

    if (!matchGroup) {
      return NextResponse.json(
        { error: "匹配不存在" },
        { status: 404 }
      )
    }

    if (matchGroup.status !== "matching") {
      return NextResponse.json(
        { error: "该匹配已结束" },
        { status: 400 }
      )
    }

    if (matchGroup.participants.length >= 4) {
      return NextResponse.json(
        { error: "该匹配已满员" },
        { status: 400 }
      )
    }

    const existingParticipant = matchGroup.participants.find(
      (p) => p.userId === session.user.id
    )

    if (existingParticipant) {
      return NextResponse.json(
        { error: "您已参与该匹配" },
        { status: 400 }
      )
    }

    await prisma.matchGroupParticipant.create({
      data: {
        groupId: params.id,
        userId: session.user.id,
        role: "member",
        status: "confirmed",
      },
    })

    if (matchGroup.participants.length + 1 >= 4) {
      await prisma.matchGroup.update({
        where: { id: params.id },
        data: { status: "confirmed" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("加入匹配失败:", error)
    return NextResponse.json(
      { error: "加入匹配失败" },
      { status: 500 }
    )
  }
}
