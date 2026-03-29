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

    const { orderId, amount, paymentMethod } = await request.json()

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      )
    }

    const isParticipant = order.matchGroup.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "您不是该订单的参与者" },
        { status: 403 }
      )
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
    return NextResponse.json(
      { error: "支付失败" },
      { status: 500 }
    )
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
