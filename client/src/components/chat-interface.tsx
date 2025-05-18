import { useState } from 'react'
import { Button } from "@/components/ui/button"

function ChatInterface() {
  const [count, setCount] = useState(0)

  return (
    <div className="dark text-teal-50 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-center text-6xl font-serif">
        <span className="text-teal-300">Welcome</span>, Adventurer
      </h1>
      <div className="my-10">
        <Button className="font-semibold font-mono" onClick={() => setCount((count) => count + 1)}>
        The count is <span className="text-teal-600">{count}</span>
        </Button>
      </div>
    </div>
  )
}

export default ChatInterface
