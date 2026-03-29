import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function GET(
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
        participants: {
          include: {
            user: {
              select: {
                id: true,
                mphone: true,
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
                mphone: true,
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
      return createErrorResponse(ErrorCode.MATCH_NOT_FOUND)
    }

    return NextResponse.json(matchGroup)
  } catch (error) {
    console.error("获取匹配详情失败:", error)
    return createErrorResponse(ErrorCode.MATCH_DETAIL_FAILED)
  }
}
