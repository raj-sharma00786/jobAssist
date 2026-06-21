import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL!;
  const parsed = new URL(url.replace("mysql://", "http://"));

  const adapterConfig: ConstructorParameters<typeof PrismaMariaDb>[0] = {
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306"),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1),
    allowPublicKeyRetrieval: true,
    ssl: true,
  };

  const adapter = new PrismaMariaDb(adapterConfig);

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}