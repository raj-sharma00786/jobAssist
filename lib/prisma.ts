import { PrismaClient } from "@prisma/client";
import { PrismaTiDBCloud } from "@tidbcloud/prisma-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  
  const connectionString = process.env.DATABASE_URL!;
  
  // Initialize the TiDB Serverless HTTP adapter
  const adapter = new PrismaTiDBCloud({ url: connectionString });

  // Pass the adapter to PrismaClient
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}