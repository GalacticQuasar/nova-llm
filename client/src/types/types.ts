export type ToolCallInfo = {
    name: string
    args: Record<string, unknown>
}

export type Message = {
    role: 'user' | 'model'
    content: string
    toolCalls?: ToolCallInfo[]
}

export type Chat = {
    id: string
    title: string
    messages: Message[]
    createdAt: number
    updatedAt: number
}

export interface ChatInputProps {
    prompt: string
    setPrompt: (prompt: string) => void
    onSend: () => void
    onStop: () => void
    isLoading: boolean
  }