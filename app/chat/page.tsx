"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
// Removed ReportCard and ProgressBar from main chat
import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
import CEOImage from "../../public/ceo-1.png";
import CFOImage from "../../public/cfo-1.png";
import CMOImage from "../../public/cmo-1.png";
import CTOImage from "../../public/cto-1.png";
// import { cRoles } from "../../roles/roles.types";
// import type { CRole } from "../../roles/chat.types";
import {
  Trash,
  Send,
  Plus,
  MessageSquare,
  Lightbulb,
  ArrowLeftToLine,
  ArrowRightToLine,
  UserRound,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import profile from "../../public/ceo-1.png";
import proBg from "../../public/proBg.png";
import AIResponseRenderer from "../../components/ui/AIResponseRenderer";
import AIRenderer from "../../components/ui/renderer";
import { useToast } from "../../components/ui/Toast";

type ProviderRole = "user" | "assistant" | "system";
interface ProviderMessage {
  role: ProviderRole;
  content: string;
  roleContext?: string; // which persona generated/asked the message
}
interface AIChatRequest {
  messages: ProviderMessage[];
  activeRole: string;
  sessionId?: string;
  userId?: string;
}
interface AIChatResponse {
  content: string;
  provider: string;
  confidence: number;
  userMessageId?: string;
}

interface Message {
  _id?: string;
  role: "user" | "ai" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  activeRole?: string;
}

interface AITitleResponse {
  title: string;
}

function normalizeForProvider(
  msgs: Array<Message | ProviderMessage>
): ProviderMessage[] {
  const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
  return msgs
    .map((m) => {
      const role: ProviderRole = ALLOWED.includes(m.role as ProviderRole)
        ? (m.role as ProviderRole)
        : "user";
      const content =
        (m as Message).content ?? (m as ProviderMessage).content ?? "";
      const roleContext =
        (m as Message).activeRole ??
        (m as ProviderMessage).roleContext ??
        undefined;

      return {
        role, // we still send 'system' here; provider will remap to 'user'
        content: typeof content === "string" ? content : String(content ?? ""),
        roleContext,
      } as ProviderMessage;
    })
    .filter((m) => m.content.trim().length > 0);
}

export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
  const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [proUser] = useState(false);
  const [activeRole, setActiveRole] = useState("Idea Validator");
  // progress score removed from main chat state
  const [localMessages, setLocalMessages] = useState<Message[]>([]); // Add local messages state
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  ); // Track which session is being deleted

  // C-Suite Advisor States
  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
  const [replyingAdvisor, setReplyingAdvisor] = useState<string | null>(null);
  const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
  const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(
    new Set()
  );
  const advisorColors: Record<string, string> = {
    ceo: "blue",
    cfo: "green",
    cto: "purple",
    cmo: "pink",
  };

  // Function to get advisor color from role name
  const getAdvisorColor = (roleName: string): string => {
    return advisorColors[roleName.toLowerCase()] || "gray";
  };

  // Function to get hex color for advisor
  const getAdvisorHexColor = (roleName: string): string => {
    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      green: "#22c55e",
      purple: "#8b5cf6",
      pink: "#ec4899",
      gray: "#6b7280"
    };
    const colorKey = getAdvisorColor(roleName);
    return colorMap[colorKey] || colorMap.gray;
  };

  // Function to get theme colors based on active advisor
  const getThemeColors = () => {
    if (!activeAdvisor) {
      // Default theme when no advisor is selected
      return {
        primary: "#6b7280", // gray
        primaryLight: "#9ca3af",
        primaryDark: "#374151",
        primaryBg: "rgba(107, 114, 128, 0.1)",
        primaryBorder: "rgba(107, 114, 128, 0.3)",
        primaryHover: "rgba(107, 114, 128, 0.2)"
      };
    }

    const colorMap: Record<string, {
      primary: string;
      primaryLight: string;
      primaryDark: string;
      primaryBg: string;
      primaryBorder: string;
      primaryHover: string;
    }> = {
      ceo: {
        primary: "#3b82f6", // blue
        primaryLight: "#60a5fa",
        primaryDark: "#1e40af",
        primaryBg: "rgba(59, 130, 246, 0.1)",
        primaryBorder: "rgba(59, 130, 246, 0.3)",
        primaryHover: "rgba(59, 130, 246, 0.2)"
      },
      cfo: {
        primary: "#22c55e", // green
        primaryLight: "#4ade80",
        primaryDark: "#15803d",
        primaryBg: "rgba(34, 197, 94, 0.1)",
        primaryBorder: "rgba(34, 197, 94, 0.3)",
        primaryHover: "rgba(34, 197, 94, 0.2)"
      },
      cto: {
        primary: "#8b5cf6", // purple
        primaryLight: "#a78bfa",
        primaryDark: "#7c3aed",
        primaryBg: "rgba(139, 92, 246, 0.1)",
        primaryBorder: "rgba(139, 92, 246, 0.3)",
        primaryHover: "rgba(139, 92, 246, 0.2)"
      },
      cmo: {
        primary: "#ec4899", // pink
        primaryLight: "#f472b6",
        primaryDark: "#be185d",
        primaryBg: "rgba(236, 72, 153, 0.1)",
        primaryBorder: "rgba(236, 72, 153, 0.3)",
        primaryHover: "rgba(236, 72, 153, 0.2)"
      }
    };

    return colorMap[activeAdvisor] || colorMap.ceo;
  };

  // Advisor color mapping


  // Use auth store
  const { user, checkAuth } = useAuthStore();

  // Use chat store
  const {
    chatSessions,
    currentSessionId,
    messages,
    isLoading,
    error,
    loadChatSessions,
    createNewChatSession,
    selectChatSession,
    addMessage,
    deleteChatSession,
    updateSessionTopic,
    clearError,
    // removed progress score from store usage
  } = useChatStore();

  // Sync local messages with store messages when they change
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Use localMessages for rendering instead of messages from store
  const displayMessages = localMessages;

  const currentSession = chatSessions.find(
    (session) => session._id === currentSessionId
  );

  const createNewChat = useCallback(
    async (isAutoCreate = false) => {
      // Skip pro user check for auto-creation
      if (!isAutoCreate && proUser) {
        router.push("/pricing");
        return;
      }

      if (!user?.id) {
        console.error("No user ID available");
        return;
      }

      try {
        const initialMessage =
          "Hello! I'm your 021 AI. How can I help you today?";
        await createNewChatSession(user.id, "New Chat", initialMessage);

        // If this is auto-creation, also set the initial message in local state
        if (isAutoCreate) {
          const welcomeMessage: Message = {
            _id: Date.now().toString() + "_welcome",
            role: "ai",
            content: initialMessage,
            timestamp: new Date(),
            activeRole: "Idea Validator",
          };
          setLocalMessages([welcomeMessage]);
          setActiveRole("Idea Validator");
          setActiveAdvisor(null);
          setClickedAdvisors(new Set());
        }
      } catch (error) {
        console.error("Failed to create new chat:", error);
        toast({
          variant: "error",
          title: "Could not create chat",
          description: "Please try again in a moment.",
        });
      }
    },
    [proUser, router, user?.id, createNewChatSession, toast]
  );

  // Wrapper function for button click handler
  const handleCreateNewChat = useCallback(() => {
    createNewChat(false);
  }, [createNewChat]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/logout", { method: "GET" });
      // The auth store will be updated by the logout route
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const handleNavigateToPricing = useCallback(() => {
    router.push("/pricing");
  }, [router]);

  // report navigation removed from main chat

  // const handleToggleSidebar = useCallback(() => {
  //   setSidebarOpen((prev) => !prev);
  // }, []);

  const handleCloseSidebarleft= useCallback(() => {
    setSidebarOpenLeft(false);
  }, []);
  const handleOpenSidebarleft= useCallback(() => {
    setSidebarOpenLeft(true);
  }, []);
  const handleCloseSidebarright = useCallback(() => {
    setSidebarOpenRight(false);
  }, []);
  const handleOpenSidebarright = useCallback(() => {
    setSidebarOpenRight(true);
  }, []);

  // const handleToggleAdvisorPanel = useCallback(() => {
  //   setSidebarOpen(prev => !prev);
  // }, []);

  // const handleRoleChange = useCallback((role: { name: string }) => {
  //   setActiveRole(role.name);
  // }, []);

  // C-Suite Advisor handlers - replacing FloatingNav functionality
  const handleAdvisorClick = useCallback(
    (advisorKey: string, advisorName: string) => {
      if (replyingAdvisor === advisorKey || thinkingAdvisor === advisorKey)
        return;

      setActiveAdvisor(advisorKey);
      setActiveRole(advisorName);
      setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
    },
    [replyingAdvisor, thinkingAdvisor]
  );

  // Handle role change from C-Suite cards (replacing FloatingNav)
  // const handleRoleChange = useCallback((role: CRole) => {
  //   setActiveRole(role.name);
  //   setActiveAdvisor(role.id);
  // }, []);

  const handleSelectChatSession = useCallback(
    async (sessionId: string) => {
      try {
        await selectChatSession(sessionId);

        // Restore active role from session messages
        const session = chatSessions.find((s) => s._id === sessionId);
        if (session) {
          // Find the last message with an activeRole to restore the advisor state
          const lastMessageWithRole = localMessages
            .filter(
              (msg) => msg.activeRole && msg.activeRole !== "Idea Validator"
            )
            .pop();

          if (lastMessageWithRole?.activeRole) {
            setActiveRole(lastMessageWithRole.activeRole);

            // Map role name back to advisor key
            const roleToAdvisorMap: { [key: string]: string } = {
              CEO: "ceo",
              CFO: "cfo",
              CTO: "cto",
              CMO: "cmo",
            };

            const advisorKey = roleToAdvisorMap[lastMessageWithRole.activeRole];
            if (advisorKey) {
              setActiveAdvisor(advisorKey);
              setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
            }
          } else {
            setActiveRole("Idea Validator");
            setActiveAdvisor(null);
          }
        }
      } catch (error) {
        console.error("Failed to select chat session:", error);
        toast({
          variant: "error",
          title: "Could not load chat",
          description: "Please try again.",
        });
      }
    },
    [selectChatSession, chatSessions, localMessages, toast]
  );

  const dynamicTitle = useCallback(
    async (messages: Message): Promise<string> => {
      const userMsg = messages.content;
      try {
        const response = await fetch("/api/ai-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userMsg }),
        });
        const data: AITitleResponse = await response.json();
        return data.title;
      } catch (error) {
        console.error("error in dynamicTitle", error);
        return "Error generating title";
      }
    },
    []
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id)
      return;

    // Prepare the user message
    const userMessage: Message = {
      _id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      activeRole: activeRole,
    };

    // Add user message to local state immediately
    const newMessages = [...localMessages, userMessage];

    // Compute messages for request *now* to avoid stale state after setState
    const requestMessagesBase: Message[] = newMessages;

    // Update session topic if it's still "New Chat"
    if (currentSession?.topic === "New Chat") {
      try {
        const title = (await dynamicTitle(userMessage)) || "new chat";
        await updateSessionTopic(currentSessionId, title);
      } catch (error) {
        console.error("Failed to update session topic:", error);
      }
    }

    // Add user message to store (this will save to database)
    try {
      await addMessage(inputValue.trim(), "user", currentSessionId);
    } catch (error) {
      console.error("Failed to save user message:", error);
    }

    // Update local state immediately to show user message
    setLocalMessages(newMessages);

    setInputValue("");
    setIsTyping(true); // ✅ show typing immediately

    // Set thinking state for active advisor
    if (activeAdvisor) {
      setThinkingAdvisor(activeAdvisor);
    }

    // Build safe API payload
    const requestBody: AIChatRequest = {
      messages: normalizeForProvider(requestMessagesBase).map((m) => ({
        // Providers will treat 'system' as 'user' internally when needed
        role: m.role,
        content: m.content,
        roleContext: m.roleContext,
      })),
      activeRole,
      sessionId: currentSessionId,
      userId: user.id,
    };

    try {
      // ⛳ NOTE: ensure this endpoint exists; in Next.js, prefer an API route like `/api/ai-chat`
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data: AIChatResponse = await response.json();
      if (process.env.NODE_ENV === "development")
        console.log("checking data in page.tsx", data);

      if (!response.ok) {
        console.error("API Error:", response.status, data);
        throw new Error(
          `API error: ${response.status} - ${data?.content || "Unknown error"}`
        );
      }

      // no progress score handling

      // AI response is already saved in the API, so we just need to reload the session
      // But don't reload the entire session to avoid duplicate messages
      // Instead, just add the AI response to local state
      const aiMessage: Message = {
        _id: Date.now().toString() + "_ai",
        role: "ai",
        content: data.content,
        timestamp: new Date(),
        activeRole: activeRole,
      };

      setLocalMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("error in chat: ", error);

      let errorMessage = "Unexpected error occurred.";

      if (
        error instanceof TypeError &&
        String(error.message || "").includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (
        error instanceof Error &&
        String(error.message || "").includes("API error")
      ) {
        errorMessage =
          "AI service is temporarily unavailable. Please try again later.";
      } else if (error instanceof Error && error.message) {
        errorMessage = `Unexpected error: ${error.message}`;
      } else {
        errorMessage = `Unexpected error: ${String(error)}`;
      }

      // Save error message to database
      try {
        await addMessage(errorMessage, "ai", currentSessionId);
      } catch (saveError) {
        console.error("Failed to save error message:", saveError);
      }

      // Add error message to local state
      const errorMsg: Message = {
        _id: Date.now().toString() + "_error",
        role: "ai",
        content: errorMessage,
        timestamp: new Date(),
        activeRole: activeRole,
      };

      setLocalMessages((prev) => [...prev, errorMsg]);
      toast({
        variant: "error",
        title: "Message failed",
        description: errorMessage,
      });
    } finally {
      setIsTyping(false); // ✅ always clear typing

      // Clear thinking state and set replying state for active advisor
      if (activeAdvisor) {
        setThinkingAdvisor(null);
        setReplyingAdvisor(activeAdvisor);

        // Clear replying state after a short delay
        setTimeout(() => {
          setReplyingAdvisor(null);
        }, 1000);
      }
    }
  }, [
    inputValue,
    isTyping,
    currentSessionId,
    user?.id,
    localMessages,
    currentSession?.topic,
    activeRole,
    activeAdvisor,
    updateSessionTopic,
    addMessage,
    setLocalMessages,
    setInputValue,
    setIsTyping,
    dynamicTitle,
    toast,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleDeleteChatSession = useCallback(
    async (sessionId: string) => {
      try {
        // Don't allow deleting if it's the only session
        if (chatSessions.length === 1) {
          toast({
            variant: "warning",
            title: "Cannot delete",
            description:
              "You can't delete the last chat. Please create another chat first.",
          });
          return;
        }

        // Confirm deletion
        const confirmed = window.confirm(
          "Delete this chat session? This action cannot be undone."
        );
        if (!confirmed) return;

        setDeletingSessionId(sessionId); // Set loading state
        await deleteChatSession(sessionId);
      } catch (error) {
        console.error("Failed to delete chat session:", error);
        toast({
          variant: "error",
          title: "Delete failed",
          description: "We couldn't delete the chat. Please try again.",
        });
      } finally {
        setDeletingSessionId(null); // Clear loading state
      }
    },
    [chatSessions.length, deleteChatSession, toast]
  );

  // Optionally fetch user once for rendering; middleware handles protection
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check for incoming message from home page
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const newChatMessage = sessionStorage.getItem("newChatMessage");
      const shouldCreateNewChat =
        sessionStorage.getItem("createNewChat") === "true";

      if (newChatMessage) {
        // Clear the messages from storage to prevent reuse
        sessionStorage.removeItem("newChatMessage");
        sessionStorage.removeItem("createNewChat");

        // Generate a title based on the user's message
        const generateTitle = async () => {
          try {
            if (shouldCreateNewChat && user?.id) {
              // Create a message object for title generation
              const userMessage: Message = {
                _id: Date.now().toString(),
                role: "user",
                content: newChatMessage.trim(),
                timestamp: new Date(),
                activeRole: activeRole,
              };

              // Generate a title using the dynamicTitle function
              const title = await dynamicTitle(userMessage);

              // Create a new chat with the generated title
              const initialMessage =
                "Hello! I'm your 021 AI. How can I help you today?";
              await createNewChatSession(user.id, title, initialMessage);

              // Set the initial message in local state
              const welcomeMessage: Message = {
                _id: Date.now().toString() + "_welcome",
                role: "ai",
                content: initialMessage,
                timestamp: new Date(),
                activeRole: activeRole,
              };
              setLocalMessages([welcomeMessage]);

              // Store the message again temporarily for processing in the next cycle
              sessionStorage.setItem("newChatMessage", newChatMessage);
              return true;
            }
            return false;
          } catch (error) {
            console.error("Failed to generate title or create chat:", error);
            // Fall back to the default createNewChat if title generation fails
            if (shouldCreateNewChat && user?.id) {
              createNewChat(true).then(() => {
                sessionStorage.setItem("newChatMessage", newChatMessage);
              });
              return true;
            }
            return false;
          }
        };

        // If we should create a new chat, do that first with a generated title
        if (shouldCreateNewChat && user?.id) {
          generateTitle().then((created) => {
            if (created) return;
          });
          return;
        }

        // If we have a user and a current session, send the message directly
        if (user?.id && currentSessionId) {
          // Prepare the user message
          const userMessage: Message = {
            _id: Date.now().toString(),
            role: "user",
            content: newChatMessage.trim(),
            timestamp: new Date(),
            activeRole: activeRole,
          };

          // Add user message to local state immediately
          const newMessages = [...localMessages, userMessage];
          setLocalMessages(newMessages);

          // Add user message to store (this will save to database)
          addMessage(newChatMessage.trim(), "user", currentSessionId).then(
            () => {
              // After adding the user message, send it to get AI response
              // Build safe API payload
              const requestBody: AIChatRequest = {
                messages: normalizeForProvider(newMessages).map((m) => ({
                  role: m.role,
                  content: m.content,
                  roleContext: m.roleContext,
                })),
                activeRole,
                sessionId: currentSessionId,
                userId: user.id,
              };

              setIsTyping(true);

              // Send the request to get AI response
              fetch("/api/ai-chat", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              })
                .then((response) => response.json())
                .then((data: AIChatResponse) => {
                  // Add AI response to local state
                  const aiMessage: Message = {
                    _id: Date.now().toString() + "_ai",
                    role: "ai",
                    content: data.content,
                    timestamp: new Date(),
                    activeRole: activeRole,
                  };

                  setLocalMessages((prev) => [...prev, aiMessage]);
                })
                .catch((error) => {
                  console.error("error in chat: ", error);

                  let errorMessage = "Unexpected error occurred.";

                  if (
                    error instanceof TypeError &&
                    String(error.message || "").includes("fetch")
                  ) {
                    errorMessage =
                      "Network error. Please check your connection and try again.";
                  } else if (
                    error instanceof Error &&
                    String(error.message || "").includes("API error")
                  ) {
                    errorMessage =
                      "AI service is temporarily unavailable. Please try again later.";
                  } else if (error instanceof Error && error.message) {
                    errorMessage = `Unexpected error: ${error.message}`;
                  } else {
                    errorMessage = `Unexpected error: ${String(error)}`;
                  }

                  // Save error message to database
                  addMessage(errorMessage, "ai", currentSessionId);

                  // Add error message to local state
                  const errorMsg: Message = {
                    _id: Date.now().toString() + "_error",
                    role: "ai",
                    content: errorMessage,
                    timestamp: new Date(),
                    activeRole: activeRole,
                  };

                  setLocalMessages((prev) => [...prev, errorMsg]);
                  toast({
                    variant: "error",
                    title: "Message failed",
                    description: errorMessage,
                  });
                })
                .finally(() => {
                  setIsTyping(false);
                });
            }
          );
        } else if (user?.id) {
          // If we have a user but no session, create a new one and then send the message
          // Store the message temporarily
          const tempMessage = newChatMessage;
          // Create a new chat first
          createNewChat(true).then(() => {
            // Wait a bit for the session to be created and selected
            setTimeout(() => {
              // Prepare the user message
              const userMessage: Message = {
                _id: Date.now().toString(),
                role: "user",
                content: tempMessage.trim(),
                timestamp: new Date(),
                activeRole: activeRole,
              };

              // Add user message to local state immediately
              const newMessages = [...localMessages, userMessage];
              setLocalMessages(newMessages);

              // Add user message to store and handle AI response
              if (currentSessionId) {
                addMessage(tempMessage.trim(), "user", currentSessionId).then(
                  () => {
                    // After adding the user message, send it to get AI response
                    // Build safe API payload
                    const requestBody: AIChatRequest = {
                      messages: normalizeForProvider(newMessages).map((m) => ({
                        role: m.role,
                        content: m.content,
                        roleContext: m.roleContext,
                      })),
                      activeRole,
                      sessionId: currentSessionId,
                      userId: user.id,
                    };

                    setIsTyping(true);

                    // Send the request to get AI response
                    fetch("/api/ai-chat", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(requestBody),
                    })
                      .then((response) => response.json())
                      .then((data: AIChatResponse) => {
                        // Add AI response to local state
                        const aiMessage: Message = {
                          _id: Date.now().toString() + "_ai",
                          role: "ai",
                          content: data.content,
                          timestamp: new Date(),
                          activeRole: activeRole,
                        };

                        setLocalMessages((prev) => [...prev, aiMessage]);
                      })
                      .catch((error) => {
                        console.error("error in chat: ", error);
                        // Error handling similar to above
                        const errorMessage = "Unexpected error occurred.";
                        // Add error message to local state
                        const errorMsg: Message = {
                          _id: Date.now().toString() + "_error",
                          role: "ai",
                          content: errorMessage,
                          timestamp: new Date(),
                          activeRole: activeRole,
                        };

                        setLocalMessages((prev) => [...prev, errorMsg]);
                      })
                      .finally(() => {
                        setIsTyping(false);
                      });
                  }
                );
              }
            }, 1000);
          });
        }
      }
    }
  }, [
    user?.id,
    currentSessionId,
    createNewChat,
    localMessages,
    activeRole,
    createNewChatSession,
    dynamicTitle,
    addMessage,
    setLocalMessages,
    setIsTyping,
    toast,
  ]);

  // Load chat sessions when user is available
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current && user?.id) {
      hasLoadedRef.current = true;
      loadChatSessions(user.id);
    }
  }, [user?.id, loadChatSessions]);

  // Select the most recent session if available (no auto-creation)
  const didAutoActionRef = useRef(false);
  useEffect(() => {
    if (didAutoActionRef.current) return;
    if (!user?.id || isLoading) return;
    if (!hasLoadedRef.current) return; // ensure sessions have been fetched at least once

    if (!currentSessionId && chatSessions.length > 0) {
      didAutoActionRef.current = true;
      const mostRecentSession = chatSessions[0];
      handleSelectChatSession(mostRecentSession._id!);
    }
  }, [
    user?.id,
    chatSessions,
    isLoading,
    currentSessionId,
    handleSelectChatSession,
  ]);

  // Clear the auto-create guard once sessions exist
  useEffect(() => {
    if (!user?.id) return;
    if (chatSessions.length > 0) {
      const key = `auto-create-${user.id}`;
      if (typeof window !== "undefined") sessionStorage.removeItem(key);
    }
  }, [user?.id, chatSessions.length]);

  // Handle session selection when currentSessionId changes
  useEffect(() => {
    if (currentSessionId && localMessages.length === 0 && !isLoading) {
      // If we have a current session but no messages, we might need to load them
      // This handles the case when a session is selected after deletion
      const currentSession = chatSessions.find(
        (s) => s._id === currentSessionId
      );
      if (currentSession) {
        // The messages will be loaded by the store when selectChatSession is called
        // This is just a safety check
      }
    }
  }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

  // removed progress score syncing

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]); // Changed from messages to localMessages

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error("Chat store error:", error);
      toast({ variant: "error", title: "Error", description: String(error) });
      setTimeout(() => clearError(), 5000); // Auto-clear after 5 seconds
    }
  }, [error, clearError, toast]);

  // Render immediately; middleware prevents unauth access

  return (
    <div className="flex h-screen bg-radial-[at_25%_25%] from-[#010831] to-black to-75%  text-white ">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpenLeft ? "w-60" : "w-0"
        } backdrop-blur-md border-r border-white/20 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
        {/* 1. Header Container */}
        <div className="p-3 border-b border-white/20 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold font-mono">021 AI</h2>
          <button onClick={handleCloseSidebarleft} className="">
            <ArrowLeftToLine className="h-5 w-5 text-white/70 group-hover:text-white transition-colors duration-200" />
          </button>
        </div>

        {/* 2. New Chat Button Container */}
        <div className="flex justify-center p-4 flex-shrink-0">
          <button
            onClick={handleCreateNewChat}
            disabled={isLoading}
            className="group relative w-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full 
         bg-white/10 backdrop-blur-xl border border-white/20 
         hover:bg-white/20 hover:border-white/30 
         transition-all duration-300 ease-out
         shadow-lg shadow-black/10
         before:absolute before:inset-0 before:rounded-full 
         before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-white/20 
         before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
         after:absolute after:inset-0 after:rounded-full 
         after:bg-gradient-to-t after:from-transparent after:via-white/5 after:to-white/20
         after:pointer-events-none
         disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="h-5 w-5 -mr-1.5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
            <span className="relative z-10">
              {isLoading ? "Creating..." : "New Chat"}
            </span>
            <div className="absolute inset-0 rounded-full border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
          </button>
        </div>

        {/* 3. Chat Session Container */}
        <div className="flex-shrink-0 h-112 overflow-hidden">
          <div className="p-3 h-full">
            <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
              {isLoading && chatSessions.length === 0 ? (
                <div className="text-center text-white/50 text-sm py-4">
                  Loading chats...
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center text-white/50 text-sm py-4">
                  No chats yet
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => handleSelectChatSession(session._id!)}
                    className={`group relative w-full text-left rounded-2xl transition-all duration-200 ease-out overflow-hidden
    ${currentSessionId === session._id
                        ? `bg-blue-900/60 backdrop-blur-xl border border-white/25 shadow-lg shadow-white/5
           before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r 
           before:from-white/8 before:via-white/3 before:to-white/8 before:pointer-events-none
           after:absolute after:inset-px after:rounded-2xl after:bg-gradient-to-b 
           after:from-white/8 after:to-transparent after:pointer-events-none`
                        : `bg-white/4 backdrop-blur-md border border-white/8 
           hover:bg-white/8 hover:border-white/15 hover:shadow-md hover:shadow-white/3
           hover:before:opacity-100 before:absolute before:inset-0 before:rounded-2xl 
           before:bg-gradient-to-r before:from-transparent before:via-white/3 before:to-transparent
           before:opacity-0 before:transition-opacity before:duration-200 before:pointer-events-none`
                      }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleSelectChatSession(session._id!);
                    }}>
                    <div className="relative z-10 p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-white/50 group-hover:text-white/70 transition-colors duration-200" />
                          {currentSessionId === session._id && (
                            <div className="absolute inset-0 bg-white/15 rounded-full blur-sm -z-10"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-xs transition-colors duration-200 truncate ${currentSessionId === session._id
                                ? "text-white"
                                : "text-white/80 group-hover:text-white/95"
                              }`}>
                            {session.topic}
                          </div>
                        </div>
                        {currentSessionId === session._id && (
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-white/70 rounded-full duration-200 
               group-hover:-translate-x-1.5"></div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChatSession(session._id!);
                          }}
                          disabled={deletingSessionId === session._id}
                          className="hidden group-hover:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete chat session">
                          {deletingSessionId === session._id ? (
                            <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4 text-white/60 hover:text-red-500/60" />
                          )}
                        </button>
                      </div>
                    </div>

                    {currentSessionId === session._id && (
                      <div className="absolute inset-0 rounded-2xl border border-white/15 pointer-events-none"></div>
                    )}
                    <div className="absolute inset-0 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 4. Report Container */}

        {/* 5. Switch to Pro Button */}
        <div className="flex-shrink-0 p-3">
          <button
            onClick={handleNavigateToPricing}
            className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl border border-purple-400/4 hover:border-purple-300/60 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all duration-300 ease-out shadow-lg shadow-purple-500/15 hover:shadow-purple-400/25 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-px after:rounded-2xl after:bg-gradient-to-b after:from-white/10 after:to-transparent after:pointer-events-none">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Image
                src={proBg}
                alt="Premium background"
                fill
                className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30 group-hover:from-purple-500/40 group-hover:via-indigo-400/30 group-hover:to-purple-700/40 transition-all duration-300 z-10"></div>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out z-20"></div>
            <div className="relative z-30 flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 text-purple-200 group-hover:text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-300"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2.7-2h8.6l.9-4.4L14 12l-2-4-2 4-3.2-2.4L7.7 14z" />
              </svg>
              <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-100 transition-all duration-300 font-serif drop-shadow-sm">
                SWITCH TO PRO
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
            </div>
            <div className="absolute inset-0 rounded-2xl border border-purple-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-t from-purple-400/10 to-indigo-200/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
          </button>
        </div>

        {/* 6. Profile + Logout */}
        <div className="flex-shrink-0 p-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 h-14 bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl px-3 py-2 hover:bg-white/12 hover:border-white/30 transition-all duration-300 shadow-lg shadow-black/5 relative overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/5 before:via-transparent before:to-white/15 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-px after:rounded-2xl after:bg-gradient-to-b after:from-white/8 after:to-transparent after:pointer-events-none">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 blur-sm"></div>
                <Image
                  className="h-9 w-9 rounded-full relative z-10 border border-white/25"
                  src={profile}
                  alt="profile"
                />
                <div className="absolute inset-0 rounded-full border border-white/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-white text-xs font-medium leading-tight">
                  {user?.email
                    ? (() => {
                      const namePart = user.email.split("@")[0];
                      return namePart.length > 12
                        ? namePart.slice(0, 12)
                        : namePart;
                    })()
                    : "Loading..."}
                </p>
                <p className="text-white/50 text-xs leading-tight">Free tier</p>
              </div>
              <div className="absolute inset-1 rounded-2xl bg-gradient-to-t from-transparent via-transparent to-white/3 pointer-events-none"></div>
            </div>

            <button
              onClick={handleLogout}
              className="group relative flex justify-center items-center w-10 h-14 rounded-2xl 
     bg-gradient-to-br from-red-500/15 via-pink-500/10 to-purple-600/15 
     backdrop-blur-xl border border-white/20
     hover:from-red-400/25 hover:via-pink-400/20 hover:to-purple-500/25
     hover:border-white/35 hover:scale-[1.02]
     active:scale-[0.98]
     transition-all duration-200 ease-out
     shadow-lg hover:shadow-xl
     before:absolute before:inset-0 before:rounded-2xl 
     before:bg-gradient-to-t before:to-white/8
     before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200
     after:absolute after:inset-px after:rounded-2xl 
     after:bg-gradient-to-b before:from-white/5 after:to-transparent after:pointer-events-none">
              <LogOut className="h-4 w-4 text-white/70 group-hover:text-white group-hover:rotate-6 transition-transform duration-200 relative z-10" />
              <div className="absolute inset-0 rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              <div className="absolute inset-1 rounded-2xl bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="backdrop-blur-md border-b border-white/20 px-6 py-3">
          <div className="flex items-center gap-4">
            {!sidebarOpenLeft && (
              <button onClick={handleOpenSidebarleft}>
                <ArrowRightToLine className="h-5 w-5 text-white/70 group-hover:text-white transition-colors duration-200" />
              </button>
            )}

            <div className="rounded-full flex items-center justify-center text-white">
              <UserRound />
            </div>

            <div>
              <h1 className="text-xl font-bold font-mono">{activeRole}</h1>
            </div>

             {!sidebarOpenRight && (
              <button onClick={handleOpenSidebarright} className="ml-auto">
                <ArrowLeftToLine className="h-5 w-5 text-white/70 group-hover:text-white transition-colors duration-200 justify-self-end" />
              </button>
            )}

            {/* <div className="ml-auto">
              <button
                onClick={() => {
                  if (!currentSessionId || !user?.id) return;
                  // Navigate to Report page with params
                  const url = `/Report?sessionId=${encodeURIComponent(
                    currentSessionId
                  )}&userId=${encodeURIComponent(user.id)}`;
                  router.push(url);
                }}
                disabled={!currentSessionId || !user?.id}
                className="group relative p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 
                  hover:bg-white/20 hover:border-white/30 transition-all duration-300
                  shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate Report">
                <FileText className="w-5 h-5 text-white/80 group-hover:text-white" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto relative">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoading && displayMessages.length === 0 ? (
              <div className="text-center text-white/50 text-sm py-8">
                {currentSessionId
                  ? "Loading messages..."
                  : chatSessions.length > 0
                    ? "Loading your chat..."
                    : "Creating your first chat..."}
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center text-white/50 text-sm py-8">
                {currentSessionId
                  ? "No messages yet. Start a conversation!"
                  : "Setting up your chat..."}
              </div>
            ) : (
              displayMessages.map((message) => (
                <div
                  key={message._id || Math.random().toString()}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}>
                  <div
                    className={`flex max-w-screen items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                      }`}>
                    <div
                      className={`rounded-2xl px-3 py-2 backdrop-blur-md ${message.role === "user"
                          ? "bg-white/10 border border-white/10 max-w-xl"
                          : message.activeRole &&
                            message.activeRole !== "Idea Validator"
                            ? "max-w-4xl border-l-4"
                            : "max-w-4xl"
                        } text-white break-words text-wrap bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60`}
                      style={{
                        borderLeftColor: message.activeRole &&
                          message.activeRole !== "Idea Validator"
                          ? getAdvisorHexColor(message.activeRole)
                          : undefined
                      }}>
                      <div className="whitespace-pre-wrap text-sm/5">
                        <AIResponseRenderer content={message.content} />
                        {/* <AIRenderer content={message.content}/> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-xs text-white/70">
                        Assistant is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* C-Suite Advisor Toggle Button */}
          <div className="absolute top-4 right-4 flex gap-2">
            {!sidebarOpenRight && (
              <button
                onClick={handleOpenSidebarright}
                className="group relative p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 
                  hover:bg-white/20 hover:border-white/30 transition-all duration-300
                  shadow-lg shadow-black/10"
                title="Open C-Suite Advisors">
                <svg
                  className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>
            )}
          </div> 
        </div>

        {/* Input Area */}
        <div className="backdrop-blur-md px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div
                  className="relative rounded-2xl bg-transparent backdrop-blur-xl border-2 border-white/20 
                    shadow-lg shadow-black/10 
                    before:absolute before:inset-0 before:rounded-2xl 
                    before:pointer-events-none
                    after:absolute after:inset-px after:rounded-2xl 
                    after:pointer-events-none
                    hover:border-white/30 hover:bg-white/8 transition-all duration-300">
                  <textarea
                    placeholder={
                      currentSessionId
                        ? "Type your message here..."
                        : chatSessions.length > 0
                          ? "Loading your chat..."
                          : "Creating your chat..."
                    }
                    className="w-full min-h-[40px] max-h-[84px] resize-none bg-transparent px-4 py-3 
                   text-white placeholder-white/60 focus:outline-none relative z-10
                   scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-2xl"
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping || !currentSessionId}
                  />

                  {/* Buttons Row */}
                  <div className="flex justify-between items-center px-3 py-2 ">
                    {/* Left Button (Idea Validator) */}
                    <button
                      onClick={() => {
                        setActiveRole("Idea Validator");
                        setActiveAdvisor("idea_validator");
                        setClickedAdvisors(new Set(["idea_validator"]));
                      }}
                      className={`group
                     ${
                       activeRole === "Idea Validator"
                         ? "bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 backdrop-blur-sm hover:from-yellow-400/30 hover:to-yellow-500/30 border-yellow-400/40"
                         : "bg-gradient-to-r from-black/80 to-black/80 backdrop-blur-sm hover:from-yellow-400/20 hover:to-yellow-500/20 border-white/20"
                     }
                     disabled:from-white/10 disabled:to-white/5 disabled:cursor-not-allowed 
                     rounded-xl h-10 w-10 flex items-center justify-center
                     hover:border-yellow-400/40
                     transition-all duration-200 ease-out
                     shadow-md hover:shadow-lg hover:scale-105
                     before:absolute before:inset-0 before:rounded-xl 
                     ${
                       activeRole === "Idea Validator"
                         ? "before:bg-gradient-to-t before:from-transparent before:to-yellow-300/10"
                         : "before:bg-gradient-to-t before:from-transparent before:to-white/10"
                     }
                     before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200`}>
                      <Lightbulb
                        className={`h-4 w-4 transition-all duration-200 stroke-[2.5]
                          ${
                            activeRole === "Idea Validator"
                              ? "text-yellow-400 group-hover:text-yellow-300"
                              : "text-white group-disabled:text-white/40 group-hover:text-yellow-400"
                          }
                          group-hover:scale-110`}
                        fill={
                          activeRole === "Idea Validator"
                            ? "currentColor"
                            : "none"
                        }
                      />
                      <div
                        className={`absolute inset-0 rounded-xl border opacity-0 
                          ${
                            activeRole === "Idea Validator"
                              ? "border-yellow-300/50"
                              : "border-white/30"
                          }
                          group-hover:opacity-100 transition-opacity duration-200 pointer-events-none`}
                      />
                    </button>

                    {/* Right Button (Send) */}
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        !inputValue.trim() || isTyping || !currentSessionId
                      }
                      className="group
                     bg-gradient-to-r from-black/80 to-black/80 backdrop-blur-sm
                     hover:from-blue-400/90 hover:to-blue-500/90 
                     disabled:from-white/10 disabled:to-white/5 disabled:cursor-not-allowed 
                     rounded-xl h-10 w-10 flex items-center justify-center
                     border border-white/20 hover:border-white/40
                     transition-all duration-200 ease-out
                     shadow-md hover:shadow-lg hover:scale-105
                     before:absolute before:inset-0 before:rounded-xl 
                     before:bg-gradient-to-t before:from-transparent before:to-white/10 
                     before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200">
                      {isTyping ? (
                        <div
                          aria-busy="true"
                          className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"
                        />
                      ) : (
                        <Send
                          className="h-4 w-4 text-white group-disabled:text-white/40 
                            group-hover:translate-x-0.5 group-hover:-translate-y-0.5 
                            transition-transform duration-200 stroke-[3]"
                        />
                      )}
                      <div
                        className="absolute inset-0 rounded-xl border border-white/30 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      />
                    </button>
                  </div>

                  <div className="absolute inset-px rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* C-SUITE ADVISOR */}
      <div
        className={`${
          sidebarOpenRight ? "w-60" : "w-0"
        } backdrop-blur-md border-r border-white/20 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
        {/* 1. Header Container */}
        <div className="p-3 border-b border-white/20 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
          <button
            onClick={handleCloseSidebarright}
            className="p-1 rounded hover:bg-white/10 transition-colors">
            <ArrowRightToLine className="h-5 w-5 text-white/70 group-hover:text-white transition-colors duration-200" />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-3 overflow-y-auto">
          {/* CEO */}
          <div className="h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CEO"
              isLocked={false}
              title="Chief Executive Officer"
              expertise="Strategic Leadership & Vision"
              avatar={CEOImage}
              isActive={activeAdvisor === "ceo"}
              isReplying={replyingAdvisor === "ceo"}
              isThinking={thinkingAdvisor === "ceo"}
              isClicked={clickedAdvisors.has("ceo")}
              primaryColor={advisorColors.ceo}
              onClick={() => handleAdvisorClick("ceo", "CEO")}
            />
          </div>

          {/* CFO */}
          <div className="h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CFO"
              isLocked={false}
              title="Chief Financial Officer"
              expertise="Financial Strategy & Risk Management"
              avatar={CFOImage}
              isActive={activeAdvisor === "cfo"}
              isReplying={replyingAdvisor === "cfo"}
              isThinking={thinkingAdvisor === "cfo"}
              isClicked={clickedAdvisors.has("cfo")}
              primaryColor={advisorColors.cfo}
              onClick={() => handleAdvisorClick("cfo", "CFO")}
            />
          </div>

          {/* CTO */}
          <div className="h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CTO"
              isLocked={false}
              title="Chief Technology Officer"
              expertise="Digital Transformation & Innovation"
              avatar={CTOImage}
              isActive={activeAdvisor === "cto"}
              isReplying={replyingAdvisor === "cto"}
              isThinking={thinkingAdvisor === "cto"}
              isClicked={clickedAdvisors.has("cto")}
              primaryColor={advisorColors.cto}
              onClick={() => handleAdvisorClick("cto", "CTO")}
            />
          </div>

          {/* CMO */}
          <div className="h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CMO"
              isLocked={false}
              title="Chief Marketing Officer"
              expertise="Marketing Strategy & Brand Building"
              avatar={CMOImage}
              isActive={activeAdvisor === "cmo"}
              isReplying={replyingAdvisor === "cmo"}
              isThinking={thinkingAdvisor === "cmo"}
              isClicked={clickedAdvisors.has("cmo")}
              primaryColor={advisorColors.cmo}
              onClick={() => handleAdvisorClick("cmo", "CMO")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
