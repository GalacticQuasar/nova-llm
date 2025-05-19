import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { LLMTextarea } from "@/components/llm-textarea"
import { Send } from "lucide-react"
import { postChat } from '@/api/api'

function ChatInterface() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleSend = async () => {
    setIsLoading(true)
    try {
      const response = await postChat(prompt)
      console.log(response.responseText)
      setResponse(response.responseText)
      setIsLoading(false)
    } catch (error) {
      setIsError(true)  //TODO: Add error message with toast
      setIsLoading(false)
    }
  }
  
  return (
    <div className="dark text-teal-50 flex flex-col items-center justify-center min-h-screen">
      <h1 id="welcome-message" className="text-center text-6xl font-serif flex items-center gap-4">
        <img src="/Galactic-Logo.png" alt="Galactic Logo" className="h-16 w-16" />
        <span className="text-teal-300">Welcome,</span> User
      </h1>
      <div>
        <div
          id="chat-input-container"
          className={`m-10 rounded-2xl p-3 border-1 focus-within:border-teal-300/100 hover:border-teal-300/100 transition-all duration-300 cursor-text ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
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
                handleSend();
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
              onClick={handleSend}
              disabled={isLoading}
            >
              <Send className="scale-125" />
            </Button>
          </div>
        </div>
      </div>
      {isLoading && <div className="mt-4 text-center text-gray-500">Loading...</div>}
      {response && <div className="mt-4 text-center text-gray-500"><p>{response}</p></div>}
    </div>
  )
}

export default ChatInterface
