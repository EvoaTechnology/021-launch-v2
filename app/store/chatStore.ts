import { create } from "zustand";

/**
 * Chat Store (Zustand)
 *
 * Purpose
 * - Single source of truth for chat sessions, current selection, and messages
 * - Coordinates network calls to our chat API routes and normalizes responses
 * - Keeps UI resilient with lightweight error and loading flags
 *
 * Key Behaviors/Flow
 * - loadChatSessions(userId): fetch all sessions for a user and normalize IDs
 * - createNewChatSession(userId, topic, initialMessage?): creates a session (and optional first message)
 *   then focuses it locally; optionally triggers message loading for that session
 * - selectChatSession(sessionId): fetches one session + messages, sets as current, and normalizes IDs
 * - addMessage(content, role, sessionId): persists a message; UI can optimistically render while awaiting
 * - deleteChatSession(sessionId): removes a session; if the current session is deleted, selects the most recent
 * - updateSessionTopic(sessionId, topic): updates title locally after a successful PUT
 *
 * Error Handling
 * - All network operations capture errors and expose a human-readable message via `error`
 * - Callers may surface this `error` via toasts; `clearError()` resets state
 *
 * Edge Cases
 * - Sessions are deduped by `_id` to guard against accidental duplication from the backend
 * - After session deletion, the store attempts to select a next-best session and clears messages if needed
 * - Normalization: Mongo `_id` fields are converted to string to stabilize component keys and comparisons
 */

export interface ChatMessage {
  _id?: string;
  content: string;
  role: "user" | "ai";
  sessionId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSession {
  _id?: string;
  userId: string;
  topic: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatStore {
  // State
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  prompt: string;
  // progress score removed

  // Actions
  setPrompt: (prompt: string) => void;
  loadChatSessions: (userId: string) => Promise<void>;
  createNewChatSession: (
    userId: string,
    topic: string,
    initialMessage?: string
  ) => Promise<string>;
  selectChatSession: (sessionId: string) => Promise<void>;
  addMessage: (
    content: string,
    role: "user" | "ai",
    sessionId: string
  ) => Promise<ChatMessage>;
  deleteChatSession: (sessionId: string) => Promise<void>;
  updateSessionTopic: (sessionId: string, topic: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  chatSessions: [],
  currentSessionId: null,
  messages: [],
  isLoading: false,
  error: null,
  prompt: "",

  // Basic prompt functionality
  setPrompt: (prompt: string) => set({ prompt }),

  // Load chat sessions for a user
  /**
   * Fetches all chat sessions for a user and normalizes each document.
   * Side effects: sets `chatSessions` list; resets `isLoading`/`error` appropriately.
   */
  loadChatSessions: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/chat?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch chat sessions");

      const sessions = await response.json();

      // Convert MongoDB documents to our interface format
      const formattedSessions: ChatSession[] = sessions.map(
        (session: {
          _id: { toString(): string };
          userId: { toString(): string };
          topic: string;

          createdAt: Date;
          updatedAt: Date;
        }) => ({
          _id: session._id?.toString(),
          userId: session.userId.toString(),
          topic: session.topic,

          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        })
      );

      // Dedupe by _id in case of accidental duplicates
      const uniqueSessions = Array.from(
        new Map(
          formattedSessions
            .filter((s) => Boolean(s._id))
            .map((s) => [s._id as string, s])
        ).values()
      );

      set({ chatSessions: uniqueSessions });
    } catch (error) {
      set({ error: `Failed to load chat sessions: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new chat session
  /**
   * Creates a new chat session; may optionally include an initial AI message.
   * On success, the new session is selected and added to the top of the list.
   * If `initialMessage` is passed, messages for the new session are also fetched.
   */
  createNewChatSession: async (
    userId: string,
    topic: string,
    initialMessage?: string
  ) => {
    try {
      set({ isLoading: true, error: null });

      let response;
      if (initialMessage) {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "createSessionWithMessage",
            userId,
            topic,
            initialMessage: {
              content: initialMessage,
              role: "ai",
            },
          }),
        });
      } else {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "createSession",
            userId,
            topic,
          }),
        });
      }

      if (!response.ok) throw new Error("Failed to create chat session");
      const session = await response.json();

      // Convert MongoDB document to our interface format
      const formattedSession: ChatSession = {
        _id: session._id?.toString(),
        userId: session.userId.toString(),
        topic: session.topic,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };

      // Add to local state (de-duplicate by _id)
      set((state) => {
        const existingWithoutSame = state.chatSessions.filter(
          (s) => s._id !== formattedSession._id
        );
        return {
          chatSessions: [formattedSession, ...existingWithoutSame],
          currentSessionId: formattedSession._id!,
        };
      });

      // Load messages for this session
      if (initialMessage && formattedSession._id) {
        await get().selectChatSession(formattedSession._id);
      }

      return formattedSession._id!;
    } catch (error) {
      set({ error: `Failed to create chat session: ${error}` });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Select a chat session and load its messages
  /**
   * Loads a specific session and its messages and selects it as the current session.
   * Validates the owner ID from existing sessions to avoid spoofed requests.
   */
  selectChatSession: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Resolve the owning userId from known sessions to pass to the API
      const sessionOwnerId = get().chatSessions.find(
        (s) => s._id === sessionId
      )?.userId;
      if (!sessionOwnerId) {
        throw new Error("Unable to resolve session owner");
      }

      const response = await fetch(
        `/api/chat?userId=${sessionOwnerId}&sessionId=${sessionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch chat session");

      const chatData = await response.json();
      if (!chatData) {
        throw new Error("Chat session not found");
      }

      // Convert MongoDB documents to our interface format
      const formattedMessages: ChatMessage[] = chatData.messages.map(
        (message: {
          _id: { toString(): string };
          content: string;
          role: string;
          sessionId: { toString(): string };
          createdAt: Date;
          updatedAt: Date;
        }) => ({
          _id: message._id?.toString(),
          content: message.content,
          role: message.role,
          sessionId: message.sessionId.toString(),
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        })
      );

      set({
        currentSessionId: sessionId,
        messages: formattedMessages,
      });
    } catch (error) {
      set({ error: `Failed to load chat session: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new message to the current session
  /**
   * Persists a new message to the API and appends it locally on success.
   * The UI may also perform optimistic updates where appropriate.
   */
  addMessage: async (
    content: string,
    role: "user" | "ai",
    sessionId: string
  ) => {
    try {
      set({ error: null });

      // Save to database
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addMessage",
          content,
          role,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save message");
      const savedMessage = await response.json();

      // Convert MongoDB document to our interface format
      const formattedMessage: ChatMessage = {
        _id: savedMessage._id?.toString(),
        content: savedMessage.content,
        role: savedMessage.role,
        sessionId: savedMessage.sessionId.toString(),
        createdAt: savedMessage.createdAt,
        updatedAt: savedMessage.updatedAt,
      };

      // Add to local state
      set((state) => ({
        messages: [...state.messages, formattedMessage],
      }));

      return formattedMessage;
    } catch (error) {
      set({ error: `Failed to save message: ${error}` });
      throw error;
    }
  },

  // Delete a chat session
  /**
   * Deletes a session. If the deleted session was selected, attempts to select
   * the most recent remaining session and clears messages until they are fetched.
   */
  deleteChatSession: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Get current user ID from the first session (they should all have the same userId)
      const currentSessions = get().chatSessions;
      if (currentSessions.length === 0) {
        throw new Error("No sessions available");
      }
      const userId = currentSessions[0].userId;

      const response = await fetch(
        `/api/chat?sessionId=${sessionId}&userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete chat session");
      }

      // Remove from local state
      set((state) => {
        const updatedSessions = state.chatSessions.filter(
          (s) => s._id !== sessionId
        );
        let newCurrentSessionId = state.currentSessionId;
        let newMessages = state.messages;

        // If we deleted the current session, handle it properly
        if (sessionId === state.currentSessionId) {
          if (updatedSessions.length > 0) {
            // Select the most recent session
            newCurrentSessionId = updatedSessions[0]._id!;
            // Clear messages - they will be loaded when selectChatSession is called
            newMessages = [];
          } else {
            // No sessions left
            newCurrentSessionId = null;
            newMessages = [];
          }
        }

        return {
          chatSessions: updatedSessions,
          currentSessionId: newCurrentSessionId,
          messages: newMessages,
        };
      });

      // If we have a new current session, load its messages
      const { currentSessionId } = get();
      if (currentSessionId) {
        await get().selectChatSession(currentSessionId);
      }
    } catch (error) {
      console.error("Delete session error:", error);
      set({ error: `Failed to delete chat session: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  // Update session topic
  /**
   * Updates the session topic and reflects the change in local state upon success.
   */
  updateSessionTopic: async (sessionId: string, topic: string) => {
    try {
      set({ error: null });

      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSessionTopic",
          sessionId,
          topic,
        }),
      });

      if (!response.ok) throw new Error("Failed to update session topic");

      // Update local state
      set((state) => ({
        chatSessions: state.chatSessions.map((s) =>
          s._id === sessionId ? { ...s, topic } : s
        ),
      }));
    } catch (error) {
      set({ error: `Failed to update session topic: ${error}` });
    }
  },

  // Clear error
  /**
   * Resets the last error message.
   */
  clearError: () => set({ error: null }),
}));
