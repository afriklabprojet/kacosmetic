import { config } from "dotenv"
config({ path: ".env.local" })

import bcrypt from "bcryptjs"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

const email    = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error("Usage: npx tsx scripts/set-admin-password.ts <email> <password>")
  process.exit(1)
}

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash: hash, role: "ADMIN" },
    create: {
      email,
      passwordHash: hash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  console.log(`✓ Mot de passe admin défini pour ${user.email} (id: ${user.id})`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
