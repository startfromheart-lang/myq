import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ErrorCodes } from "@/lib/error-codes"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: ErrorCodes.UNAUTHORIZED.message, code: ErrorCodes.UNAUTHORIZED.code },
        { status: 401 }
      )
    }

    const { revieweeId, matchGroupId, skillScore, integrityScore, personalityTags, content } = await request.json()

    if (!revieweeId || !matchGroupId || !skillScore || !integrityScore) {
      return NextResponse.json(
        { error: ErrorCodes.INVALID_PARAMS.message, code: ErrorCodes.INVALID_PARAMS.code },
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
        { error: ErrorCodes.ALREADY_REVIEWED.message, code: ErrorCodes.ALREADY_REVIEWED.code },
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
      { error: ErrorCodes.REVIEW_FAILED.message, code: ErrorCodes.REVIEW_FAILED.code },
      { status: 500 }
    )
  }
}
