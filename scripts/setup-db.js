import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function setupDatabase() {
  try {
    console.log("Starting database setup...");

    // Generate Prisma client
    console.log("Generating Prisma client...");
    await execAsync("npx prisma generate");

    // Try to deploy migrations
    try {
      console.log("Attempting to deploy migrations...");
      await execAsync("npx prisma migrate deploy");
      console.log("Migrations deployed successfully!");
    } catch {
      console.log("Migration deploy failed, attempting to reset database...");
      await execAsync("npx prisma migrate reset --force --skip-seed");
      await execAsync("npx prisma migrate deploy");
      console.log("Database reset and migrations deployed successfully!");
    }

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
