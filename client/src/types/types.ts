export type ToolCallInfo = {
    name: string
    args: Record<string, unknown>
}

export type Message = {
    role: 'user' | 'model'
    content: string
    toolCalls?: ToolCallInfo[]
}

export interface ChatInputProps {
    prompt: string
    setPrompt: (prompt: string) => void
    onSend: () => void
    onStop: () => void
    isLoading: boolean
  }