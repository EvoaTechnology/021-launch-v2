import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// this function is to export the db connection
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI!;
  // Never log connection strings in production

  if (!MONGODB_URI) {
    throw new Error("Please define mongodb uri in env file");
  }

  // ---------Possiblity No.1---------
  // if conn is present in cached then return the connection.
  if (cached.conn) {
    return cached.conn;
  }

  // ---------Possiblity No.2---------
  //if promise is not created to made a connection then create one.(now goto try catch cuz connection request(promise) is sent and wait for the connection to eshtablish)
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => mongoose.connection);
  }

  // if promise is there running then wait for the connection to return, and check if there is any error.
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  // now when connection is established then return the connection
  return cached.conn;
}

// Alias for backward compatibility
export const connectToDB = connectToDatabase;
