# Database Setup Guide

This guide will help you set up the MongoDB database for the zero-to-one AI chat application.

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- The project dependencies installed (`npm install`)

## Quick Setup

### 1. Environment Configuration

Copy the example environment file and configure your MongoDB connection and Supabase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` and set your configuration:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/zero-to-one

# For MongoDB Atlas, use this format instead:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Supabase Configuration (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Initialize Database

Run the database initialization script:

```bash
npm run db:init
```

This will:

- Connect to your MongoDB instance
- Create the necessary collections
- Set up database indexes for performance

### 3. Test Database Connection

Test that everything is working:

```bash
npm run db:test
```

This will verify:

- MongoDB connection is successful
- Collections can be created and queried
- Supabase UUID format is compatible

### 4. Start the Application

```bash
npm run dev
```

## Database Schema

The application uses the following MongoDB collections:

### Users

- **Collection**: `users` (optional - for additional user data beyond Supabase auth)
- **Fields**: name, email, password, role, ideaValidated, ideaId, timestamps
- **Note**: Primary user authentication is handled by Supabase. This collection can store additional user metadata.

### Ideas

- **Collection**: `ideas`
- **Fields**: title, problem, solution, marketSize, businessModel, competitors, differentiators, ideaValidationStatus, timestamps

### Chat Sessions

- **Collection**: `chatsessions`
- **Fields**: userId, topic, timestamps

### Chat Messages

- **Collection**: `chats`
- **Fields**: content, role, sessionId, timestamps

## Supabase Integration

This application uses **Supabase for authentication** and **MongoDB for chat data storage**. This hybrid approach gives you:

- **Supabase**: Secure user authentication, user management, and session handling
- **MongoDB**: Flexible document storage for chat conversations, ideas, and business data
- **Best of both worlds**: Enterprise-grade auth with powerful document storage

### How It Works

1. **Authentication**: Users sign in/up through Supabase
2. **User ID**: Supabase provides a unique UUID for each user
3. **Data Storage**: This UUID is used to link chat sessions and messages in MongoDB
4. **Seamless Integration**: The chat interface works transparently with both systems

## Features

### ✅ What's Working

1. **Database Connection**: MongoDB connection with connection pooling
2. **Chat Storage**: All user messages and AI responses are stored in the database
3. **Session Management**: Chat sessions are persisted and can be resumed
4. **User Management**: User data is stored and linked to their chats
5. **Idea Tracking**: Business ideas can be stored and validated
6. **Real-time Updates**: Chat interface updates in real-time as messages are saved

### 🔧 Database Operations

- **Create Chat Session**: Automatically creates a new session when starting a new chat
- **Store Messages**: Both user input and AI responses are saved
- **Load History**: Previous conversations are loaded when selecting a session
- **Delete Sessions**: Chat sessions can be deleted (with all associated messages)
- **Update Topics**: Session topics are automatically updated based on conversation content

## Troubleshooting

### Common Issues

1. **Connection Failed**

   - Check your MongoDB URI in `.env.local`
   - Ensure MongoDB is running (if local)
   - Verify network access (if using Atlas)

2. **Permission Denied**

   - Check MongoDB user permissions
   - Ensure database exists and is accessible

3. **Chats Not Loading**
   - Check browser console for errors
   - Verify user authentication
   - Check database connection logs

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=mongoose:*
```

### Reset Database

To reset the database (⚠️ **WARNING**: This will delete all data):

```bash
npm run db:reset
```

## Development

### Adding New Collections

1. Create a new model in the `model/` directory
2. Add it to `lib/services/database-service.ts`
3. Update `lib/init-db.ts` to include the new collection

### Database Migrations

For production deployments, consider using a migration tool like `migrate-mongo` for schema changes.

## Production Considerations

1. **Connection Pooling**: Already configured for optimal performance
2. **Indexes**: Automatically created for common query patterns
3. **Error Handling**: Graceful fallbacks if database operations fail
4. **Security**: Use environment variables for sensitive configuration

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your MongoDB connection string
3. Ensure all dependencies are installed
4. Check the database logs for connection issues

## Next Steps

With the database now working:

1. **Test Chat Functionality**: Start a conversation and verify messages are saved
2. **Check Persistence**: Refresh the page and ensure chats are still there
3. **User Management**: Test user creation and authentication through Supabase
4. **Idea Validation**: Test the idea validation workflow

## Important Notes

- **User IDs**: The application uses Supabase UUIDs (e.g., `123e4567-e89b-12d3-a456-426614174000`) to link chat data
- **Authentication**: All user authentication is handled by Supabase - no need to manage passwords in MongoDB
- **Data Linking**: Chat sessions and messages are automatically linked to authenticated users via their Supabase UUID

The application now has full database persistence for all chat functionality while leveraging Supabase's robust authentication! 🎉
