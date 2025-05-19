import { Button } from "@/components/ui/button"
import { LLMTextarea } from "@/components/llm-textarea"
import { Send } from "lucide-react"
import type { ChatInputProps } from "@/components/chat-input"

export function ChatInputStart({ prompt, setPrompt, isLoading, onSend }: ChatInputProps) {
  return (
    <div
      id="chat-input-container"
      className={`m-10 rounded-2xl p-3 border-1 bg-secondary focus-within:border-teal-300/100 hover:border-teal-300/100 transition-all duration-300 cursor-text ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={(e) => {
        const textarea = e.currentTarget.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }}
    >
      <LLMTextarea 
        className="w-160 font-mono" 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="How can I help you today?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="icon" 
          className="font-semibold font-mono hover:text-teal-300" 
          onClick={onSend}
          disabled={isLoading}
        >
          <Send className="scale-125" />
        </Button>
      </div>
    </div>
  )
} 