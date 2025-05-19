import { useState } from 'react'
import { ChatInput } from "@/components/chat-input"
import { postChat } from '@/api/api'

type Message = {
  role: 'user' | 'llm'
  content: string
}

function ChatInterface() {
  const [startState, setStartState] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleSend = async () => {
    if (startState) {
      setStartState(false)
    }

    if (!prompt.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');

    setIsLoading(true);
    try {
      const response = await postChat(prompt)
      console.log(response.responseText)
      setResponse(response.responseText)
    } catch (error) {
      setIsError(true)  //TODO: Add error message with toast
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="dark text-teal-50 flex flex-col items-center justify-center h-screen">
      {startState && <h1 id="welcome-message" className="text-center text-6xl font-serif flex items-center gap-4">
        <img src="/Galactic-Logo.png" alt="Galactic Logo" className="h-16 w-16" />
        <span className="text-teal-300">Welcome,</span> User
      </h1>}
      <div>
        <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          isLoading={isLoading}
          onSend={handleSend}
        />
      </div>
      {isLoading && <div className="mt-4 text-center text-gray-500">Loading...</div>}
      {response && <div className="mt-4 text-center text-gray-500"><p>{response}</p></div>}
    </div>
  )
}

export default ChatInterface
