import { Button } from "@/components/ui/button"
import { LLMTextarea } from "@/components/llm-textarea"
import { Send } from "lucide-react"
import type { ChatInputProps } from "@/types/types"

export function ChatInputStart({ prompt, setPrompt, onSend }: ChatInputProps) {
  return (
    <div
      id="chat-input-container"
      className={`m-10 w-160 rounded-xl p-2 border-1 bg-secondary focus-within:border-teal-300/100 hover:border-teal-300/100 hover:shadow-teal-300/20 focus-within:shadow-teal-300/20 shadow-md transition-all duration-300 cursor-text`}
      onClick={(e) => {
        const textarea = e.currentTarget.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }}
    >
      <LLMTextarea 
        className="min-h-18" 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Ask Nova anything..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          size="icon" 
          className={`cursor-pointer border-1 rounded-lg ${prompt.length > 0 ? 'text-white bg-teal-500 hover:bg-teal-600' : 'text-muted-foreground bg-transparent pointer-events-none'}`}
          onClick={onSend}
        >
          <Send className="scale-125" />
        </Button>
      </div>
    </div>
  )
} 