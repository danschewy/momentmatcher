import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables manually
const envFile = readFileSync(join(process.cwd(), ".env"), "utf-8");
const envVars: Record<string, string> = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
    process.env[key] = value;
  }
});

const sql = neon(process.env.DATABASE_URL!);

async function resetDatabase() {
  try {
    console.log("Dropping existing tables...");

    await sql`DROP TABLE IF EXISTS ad_recommendations CASCADE`;
    await sql`DROP TABLE IF EXISTS ad_moments CASCADE`;
    await sql`DROP TABLE IF EXISTS videos CASCADE`;

    console.log("Tables dropped successfully!");
    console.log("Now run: npm run db:push");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
