import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCode, createErrorResponse } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return createErrorResponse(ErrorCode.AUTH_LOGIN_REQUIRED)
    }

    const { orderId, amount, paymentMethod } = await request.json()

    if (!orderId || !amount || !paymentMethod) {
      return createErrorResponse(ErrorCode.AUTH_MISSING_PARAMS)
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        matchGroup: {
          include: {
            participants: true,
          },
        },
      },
    })

    if (!order) {
      return createErrorResponse(ErrorCode.ORDER_NOT_FOUND)
    }

    const isParticipant = order.matchGroup.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return createErrorResponse(ErrorCode.ORDER_NOT_PARTICIPANT)
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        orderId,
        amount,
        status: "success",
        paymentMethod,
      },
    })

    const allPaid = await checkAllParticipantsPaid(order.matchGroup.id, orderId)

    if (allPaid) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "paid" },
      })

      await prisma.matchGroup.update({
        where: { id: order.matchGroup.id },
        data: { status: "playing" },
      })
    }

    return NextResponse.json({
      success: true,
      payment,
      allPaid,
    })
  } catch (error) {
    console.error("支付失败:", error)
    return createErrorResponse(ErrorCode.PAYMENT_FAILED)
  }
}

async function checkAllParticipantsPaid(matchGroupId: string, orderId: string) {
  const participants = await prisma.matchGroupParticipant.findMany({
    where: { groupId: matchGroupId },
    include: {
      user: {
        include: {
          payments: {
            where: { orderId },
          },
        },
      },
    },
  })

  return participants.every(
    (p) => p.user.payments.length > 0
  )
}
