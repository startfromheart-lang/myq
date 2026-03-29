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

    const { revieweeId, matchGroupId, skillScore, integrityScore, personalityTags, content } = await request.json()

    if (!revieweeId || !matchGroupId || !skillScore || !integrityScore) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      )
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        revieweeId,
        matchGroupId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "您已评价过该用户" },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        revieweeId,
        matchGroupId,
        skillScore,
        integrityScore,
        personalityTags: JSON.stringify(personalityTags || []),
        content,
      },
    })

    const userReviews = await prisma.review.findMany({
      where: { revieweeId },
    })

    const avgSkillScore = userReviews.reduce((acc, r) => acc + r.skillScore, 0) / userReviews.length
    const avgIntegrityScore = userReviews.reduce((acc, r) => acc + r.integrityScore, 0) / userReviews.length

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        skillScore: avgSkillScore,
        integrityScore: avgIntegrityScore,
      },
    })

    return NextResponse.json({
      ...review,
      personalityTags: JSON.parse(review.personalityTags || "[]"),
    })
  } catch (error) {
    console.error("评价失败:", error)
    return NextResponse.json(
      { error: "评价失败" },
      { status: 500 }
    )
  }
}
