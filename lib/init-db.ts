import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Debug: Check if environment variables are loaded (development only)
if (process.env.NODE_ENV === "development") {
  console.log("Current working directory:", process.cwd());
  console.log(
    "Environment file path:",
    path.resolve(process.cwd(), ".env.local")
  );
  console.log("MONGODB_URI loaded:", process.env.MONGODB_URI ? "YES" : "NO");
}

import { connectToDatabase } from "./connectToDB";
import User from "../model/User";
import Idea from "../model/Idea";
import ChatSession from "../model/ChatSession";
import Chat from "../model/Chat";

export async function initializeDatabase() {
  try {
    if (process.env.NODE_ENV === "development")
      console.log("🔄 Initializing database...");

    // Connect to database
    await connectToDatabase();
    if (process.env.NODE_ENV === "development")
      console.log("✅ Connected to MongoDB");

    // Create indexes for better performance
    await User.createIndexes();
    await Idea.createIndexes();
    await ChatSession.createIndexes();
    await Chat.createIndexes();

    if (process.env.NODE_ENV === "development")
      console.log("✅ Database indexes created");

    // Note: Users are managed by Supabase authentication
    // No need to create test users here
    if (process.env.NODE_ENV === "development")
      console.log("ℹ️  Users are managed by Supabase authentication");

    if (process.env.NODE_ENV === "development")
      console.log("🎉 Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      process.exit(1);
    });
}
