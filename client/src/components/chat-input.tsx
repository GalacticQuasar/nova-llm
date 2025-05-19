import { Button } from "@/components/ui/button"
import { LLMTextarea } from "@/components/llm-textarea"
import { Send } from "lucide-react"

export interface ChatInputProps {
  prompt: string
  setPrompt: (prompt: string) => void
  onSend: () => void
}

export function ChatInput({ prompt, setPrompt, onSend }: ChatInputProps) {
  return (
    <div
      id="chat-input-container"
      className={`mb-3 w-180 rounded-2xl p-3 border-1 bg-secondary focus-within:border-teal-300/100 hover:border-teal-300/100 transition-all duration-300 cursor-text`}
      onClick={(e) => {
        const textarea = e.currentTarget.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }}
    >
      <LLMTextarea
        className="font-mono"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Reply to Nova..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="icon" 
          className={`cursor-pointer ${prompt.length > 0 ? 'text-teal-300' : 'text-muted-foreground'}`}
          onClick={onSend}
        >
          <Send className="scale-125" />
        </Button>
      </div>
    </div>
  )
} 