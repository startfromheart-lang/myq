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

    const { revieweeId, matchGroupId, skillScore, integrityScore, personalityTags, content } = await request.json()

    if (!revieweeId || !matchGroupId || !skillScore || !integrityScore) {
      return createErrorResponse(ErrorCode.AUTH_MISSING_PARAMS)
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        revieweeId,
        matchGroupId,
      },
    })

    if (existingReview) {
      return createErrorResponse(ErrorCode.REVIEW_ALREADY_DONE)
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

    const avgSkillScore = userReviews.reduce((acc: number, r: { skillScore: number }) => acc + r.skillScore, 0) / userReviews.length
    const avgIntegrityScore = userReviews.reduce((acc: number, r: { integrityScore: number }) => acc + r.integrityScore, 0) / userReviews.length

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
    return createErrorResponse(ErrorCode.REVIEW_FAILED)
  }
}
