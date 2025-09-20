import { connectToDatabase } from "./connectToDB";
import ChatSession from "../model/ChatSession";
import Chat from "../model/Chat";

export async function testDatabaseConnection() {
  try {
    if (process.env.NODE_ENV === "development")
      console.log("🧪 Testing database connection...");

    // Test connection
    await connectToDatabase();
    if (process.env.NODE_ENV === "development")
      console.log("✅ Database connection successful");

    // Test creating a sample chat session (with a dummy Supabase-style UUID)
    const testUserId = "123e4567-e89b-12d3-a456-426614174000"; // Example Supabase UUID
    const testSession = new ChatSession({
      userId: testUserId,
      topic: "Test Chat Session",
    });

    const savedSession = await testSession.save();
    if (process.env.NODE_ENV === "development")
      console.log("✅ Chat session creation successful:", savedSession._id);

    // Test creating a sample message
    const testMessage = new Chat({
      content: "This is a test message",
      role: "user",
      sessionId: savedSession._id,
    });

    const savedMessage = await testMessage.save();
    if (process.env.NODE_ENV === "development")
      console.log("✅ Chat message creation successful:", savedMessage._id);

    // Test querying
    const sessions = await ChatSession.find({ userId: testUserId });
    if (process.env.NODE_ENV === "development")
      console.log("✅ Query test successful, found sessions:", sessions.length);

    // Clean up test data
    await Chat.deleteMany({ sessionId: savedSession._id });
    await ChatSession.findByIdAndDelete(savedSession._id);
    if (process.env.NODE_ENV === "development")
      console.log("✅ Test data cleaned up");

    if (process.env.NODE_ENV === "development")
      console.log("🎉 All database tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          success
            ? "Database connection test completed successfully"
            : "Database connection test failed"
        );
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}
