import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/llm-textarea"

function ChatInterface() {
  const [count, setCount] = useState(0)

  return (
    <div className="dark text-teal-50 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-center text-6xl font-serif flex items-center gap-4">
        <img src="/Galactic-Logo.png" alt="Galactic Logo" className="h-16 w-16" />
        <span className="text-teal-300">Welcome,</span> Adventurer
      </h1>
      <div>
        <div className="m-10 rounded-2xl p-3 border-2 focus-within:border-teal-300/100 transition-all duration-300">
          <Textarea className="w-180 font-mono font-semibold" placeholder="How can I help you today?" />
          <div className="mt-2 flex justify-end">
            <Button className="font-semibold font-mono" onClick={() => setCount((count) => count + 1)}>
            The count is <span className="text-teal-600">{count}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
