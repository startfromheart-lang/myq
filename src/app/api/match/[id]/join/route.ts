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

    const matchGroup = await prisma.matchGroup.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    })

    if (!matchGroup) {
      return createErrorResponse(ErrorCode.MATCH_NOT_FOUND)
    }

    if (matchGroup.status !== "matching") {
      return createErrorResponse(ErrorCode.MATCH_ENDED)
    }

    if (matchGroup.participants.length >= 4) {
      return createErrorResponse(ErrorCode.MATCH_FULL)
    }

    const existingParticipant = matchGroup.participants.find(
      (p) => p.userId === session.user.id
    )

    if (existingParticipant) {
      return createErrorResponse(ErrorCode.MATCH_ALREADY_JOINED)
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
    return createErrorResponse(ErrorCode.MATCH_JOIN_FAILED)
  }
}
