import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"

// Polyfill WebSocket pour Node.js (serverless functions hors Edge)
if (typeof WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws")
}

// Cache les connexions WebSocket dans le même contexte serverless
neonConfig.fetchConnectionCache = true

function createPrismaClient(): PrismaClient {
  // PrismaNeon avec config pooled (Neon pooler sur port 5432)
  // Supporte de nombreuses invocations simultanées sans saturer les connexions directes
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
