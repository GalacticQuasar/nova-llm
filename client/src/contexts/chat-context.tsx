import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Chat, Message } from "@/types/types"
import { getAllChats, getChat, saveChat as dbSaveChat, deleteChat as dbDeleteChat } from "@/lib/db"

interface ChatContextType {
  chats: Chat[]
  currentChatId: string | null
  currentChat: Chat | null
  loadChat: (id: string) => void
  createChat: () => string
  saveCurrentChat: (messages: Message[], chatId?: string) => void
  deleteChat: (id: string) => void
  refreshChats: () => void
  clearCurrentChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)

  const refreshChats = useCallback(async () => {
    const allChats = await getAllChats()
    setChats(allChats)
  }, [])

  useEffect(() => {
    refreshChats()

    const params = new URLSearchParams(window.location.search)
    const chatId = params.get("chat")
    if (chatId) {
      getChat(chatId).then(chat => {
        if (chat) {
          setCurrentChatId(chat.id)
          setCurrentChat(chat)
        }
      })
    }
  }, [refreshChats])

  const loadChat = useCallback((id: string) => {
    getChat(id).then(chat => {
      if (chat) {
        setCurrentChatId(chat.id)
        setCurrentChat(chat)
        const url = new URL(window.location.href)
        url.searchParams.set("chat", id)
        window.history.replaceState(null, "", url.toString())
      }
    })
  }, [])

  const createChat = useCallback((): string => {
    const id = crypto.randomUUID()
    const now = Date.now()
    const newChat: Chat = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
    setCurrentChatId(id)
    setCurrentChat(newChat)
    dbSaveChat(newChat).then(() => refreshChats())
    const url = new URL(window.location.href)
    url.searchParams.set("chat", id)
    window.history.replaceState(null, "", url.toString())
    return id
  }, [refreshChats])

  const saveCurrentChat = useCallback(async (messages: Message[], chatId?: string) => {
    const id = chatId ?? currentChatId
    if (!id) return

    const firstUserMsg = messages.find(m => m.role === "user")
    const title = firstUserMsg
      ? firstUserMsg.content.length > 50
        ? firstUserMsg.content.slice(0, 50) + "..."
        : firstUserMsg.content
      : "New Chat"

    const updated: Chat = {
      id,
      title,
      messages,
      createdAt: currentChat?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    }

    setCurrentChat(updated)
    await dbSaveChat(updated)
    await refreshChats()
  }, [currentChatId, currentChat, refreshChats])

  const deleteChat = useCallback(async (id: string) => {
    await dbDeleteChat(id)
    if (currentChatId === id) {
      setCurrentChatId(null)
      setCurrentChat(null)
      const url = new URL(window.location.href)
      url.searchParams.delete("chat")
      window.history.replaceState(null, "", url.toString())
    }
    await refreshChats()
  }, [currentChatId])

  const clearCurrentChat = useCallback(() => {
    setCurrentChatId(null)
    setCurrentChat(null)
    const url = new URL(window.location.href)
    url.searchParams.delete("chat")
    window.history.replaceState(null, "", url.toString())
  }, [])

  const value: ChatContextType = {
    chats,
    currentChatId,
    currentChat,
    loadChat,
    createChat,
    saveCurrentChat,
    deleteChat,
    refreshChats,
    clearCurrentChat,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}