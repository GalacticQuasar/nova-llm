export type Message = {
    role: 'user' | 'model'
    content: string
}

export interface ChatInputProps {
    prompt: string
    setPrompt: (prompt: string) => void
    onSend: () => void
  }