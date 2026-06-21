import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const url = process.env.DATABASE_URL!;
const parsed = new URL(url.replace("mysql://", "http://"));

const adapter = new PrismaMariaDb({
  host: parsed.hostname,
  port: parseInt(parsed.port || "3306"),
  user: parsed.username,
  password: parsed.password,
  database: parsed.pathname.slice(1),
  ssl: true
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding problems from problems.json...");

  const filePath = path.join(__dirname, "..", "problems.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const problems: {
    title: string;
    difficulty: string;
    category: string;
    company: string;
    url: string;
    content: string;
  }[] = JSON.parse(raw);

  // Clear existing problems to avoid duplicates on re-seed
  await prisma.submission.deleteMany();
  await prisma.problem.deleteMany();

  // Insert all problems at once
  await prisma.problem.createMany({ data: problems });

  console.log(`✅ Seeded ${problems.length} problems successfully!`);

  console.log("🌱 Seeding interview experiences from experiences.json...");

  const experiencesFilePath = path.join(__dirname, "..", "experiences.json");
  const experiencesRaw = fs.readFileSync(experiencesFilePath, "utf-8");
  const parsedExperiences: {
    company: string;
    role: string;
    date: string;
    topics: string;
    summary: string;
    fullUrl: string;
  }[] = JSON.parse(experiencesRaw);

  await prisma.interviewExperience.deleteMany({});
  await prisma.interviewExperience.createMany({ data: parsedExperiences });

  console.log(
    `✅ Seeded ${parsedExperiences.length} interview experiences successfully!`
  );

  console.log("🌱 Seeding hackathons from hackathons.json...");

  const hackathonsFilePath = path.join(__dirname, "..", "hackathons.json");
  const hackathonsRaw = fs.readFileSync(hackathonsFilePath, "utf-8");
  const parsedHackathons: {
    title: string;
    organizer: string;
    date: string;
    deadline: string;
    tags: string;
    registrationUrl: string;
  }[] = JSON.parse(hackathonsRaw);

  await prisma.hackathon.deleteMany({});
  await prisma.hackathon.createMany({ data: parsedHackathons });

  console.log(`✅ Seeded ${parsedHackathons.length} hackathons successfully!`);

  // Print company breakdown
  const companies = new Map<string, number>();
  for (const p of problems) {
    companies.set(p.company, (companies.get(p.company) || 0) + 1);
  }
  for (const [company, count] of companies) {
    console.log(`   ${company}: ${count} problems`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });