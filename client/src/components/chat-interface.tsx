import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

function ChatInterface() {
  const [count, setCount] = useState(0)

  return (
    <div className="dark text-teal-50 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-center text-6xl font-serif flex items-center gap-4">
        <img src="/Galactic-Logo.png" alt="Galactic Logo" className="h-16 w-16" />
        <span className="text-teal-300">Welcome,</span> Adventurer
      </h1>
      <div>
        <div className="m-10 bg-teal-900 rounded-lg p-4">
          <Textarea className="w-180 mb-4 font-mono font-semibold" placeholder="How can I help you today?" />
          <Button className="font-semibold font-mono" onClick={() => setCount((count) => count + 1)}>
          The count is <span className="text-teal-600">{count}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
