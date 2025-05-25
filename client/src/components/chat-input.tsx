import { Button } from "@/components/ui/button"
import { LLMTextarea } from "@/components/llm-textarea"
import { Send, Settings } from "lucide-react"
import type { ChatInputProps } from "@/types/types"
import { CircleStop } from "lucide-react"
import { ConfigDialog } from "@/components/config-dialog"

export function ChatInput({ prompt, setPrompt, onSend, onStop, isLoading }: ChatInputProps) {
  return (
    <div
      id="chat-input-container"
      className={`mb-3 w-full max-w-3xl mx-3 rounded-xl p-2 border-1 bg-secondary focus-within:border-teal-300/100 hover:border-teal-300/100 hover:shadow-teal-300/20 focus-within:shadow-teal-300/20 shadow-md transition-all duration-300 cursor-text`}
      onClick={(e) => {
        const textarea = e.currentTarget.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }}
    >
      <LLMTextarea
        className="max-h-80"
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
      <div className="mt-2 flex justify-between">
        <ConfigDialog />
        <Button 
          size="icon" 
          className={`cursor-pointer border-1 rounded-lg transition-colors duration-300 ${isLoading ? ('text-white bg-input/20 hover:bg-red-600') : (prompt.length > 0 ? 'text-white bg-teal-500 hover:bg-teal-600' : 'text-muted-foreground bg-input/20 pointer-events-none')}`}
          onClick={isLoading ? onStop : onSend}
        >
          {isLoading ? <CircleStop className="scale-125" /> : <Send className="scale-125" />}
        </Button>
      </div>
    </div>
  )
} 