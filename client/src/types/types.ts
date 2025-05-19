export type Message = {
    role: 'user' | 'llm'
    content: string
}

export interface ChatInputProps {
    prompt: string
    setPrompt: (prompt: string) => void
    onSend: () => void
  }