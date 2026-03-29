import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { generateInviteCode } from "../src/lib/utils"

const prisma = new PrismaClient()

async function main() {
  console.log("开始种子数据...")

  const hashedPassword = await bcrypt.hash("123456", 10)

  const user1 = await prisma.user.upsert({
    where: { phone: "13800138001" },
    update: {},
    create: {
      phone: "13800138001",
      password: hashedPassword,
      realName: "张三",
      isVerified: true,
      skillScore: 7.5,
      integrityScore: 8.0,
      preferredMahjong: JSON.stringify(["敲麻", "川麻"]),
      personalityTags: JSON.stringify(["友善", "守时"]),
      selfEvaluation: "麻将爱好者，希望认识更多牌友",
    },
  })

  const user2 = await prisma.user.upsert({
    where: { phone: "13800138002" },
    update: {},
    create: {
      phone: "13800138002",
      password: hashedPassword,
      realName: "李四",
      isVerified: true,
      skillScore: 6.5,
      integrityScore: 7.5,
      preferredMahjong: JSON.stringify(["红中麻将"]),
      personalityTags: JSON.stringify(["幽默", "大方"]),
    },
  })

  console.log("创建用户:", { user1: user1.id, user2: user2.id })

  const inviteCode = generateInviteCode()

  const merchant = await prisma.merchant.upsert({
    where: { inviteCode },
    update: {},
    create: {
      inviteCode,
      businessLicense: "/uploads/license.jpg",
      legalPersonName: "王老板",
      legalPersonId: "310101199001011234",
      shopName: "雀友汇麻将馆",
      contactPhone: "13900139001",
      status: "approved",
      contractSigned: true,
      disclaimerAccepted: true,
    },
  })

  console.log("创建商家:", { merchant: merchant.id, inviteCode })

  const room1 = await prisma.mahjongRoom.create({
    data: {
      merchantId: merchant.id,
      name: "豪华包间1号",
      address: "浦东新区张江路88号",
      area: 25,
      price: 68,
      mahjongSize: "medium",
      maxTileCount: 8,
      hasToilet: true,
      images: JSON.stringify([]),
      status: "active",
    },
  })

  const room2 = await prisma.mahjongRoom.create({
    data: {
      merchantId: merchant.id,
      name: "标准包间2号",
      address: "浦东新区张江路88号",
      area: 20,
      price: 58,
      mahjongSize: "medium",
      maxTileCount: 4,
      hasToilet: false,
      images: JSON.stringify([]),
      status: "active",
    },
  })

  console.log("创建房间:", { room1: room1.id, room2: room2.id })

  console.log("种子数据完成!")
  console.log("测试用户账号: 13800138001, 密码: 123456")
  console.log("商家邀请码:", inviteCode)
  console.log("商家联系电话: 13900139001")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
