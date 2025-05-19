import { useState } from 'react'
import { postChat } from '@/api/api'
import { ChatInputStart } from "@/components/chat-input-start"
import { ChatInput } from "@/components/chat-input"

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
    if (!prompt.trim() || isLoading) return;

    if (startState) {
      setStartState(false)
    }

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
    <div className={`dark text-teal-50 flex flex-col ${startState ? 'items-center' : ''} justify-center h-screen`}>
      {startState && <h1 id="welcome-message" className="text-center text-6xl font-serif flex items-center gap-4">
        <img src="/Galactic-Logo.png" alt="Galactic Logo" className="h-16 w-16" />
        <span className="text-teal-300">Welcome,</span> User
      </h1>}
      <div className={`${startState ? '' : 'flex-1 overflow-y-auto'}`}>
        {isLoading && <div className="mt-4 text-center text-gray-500">Loading...</div>}
        {response && <div className="mt-4 text-center text-gray-500"><p>{response}</p></div>}
      </div>
      <div className={`flex justify-center ${startState ? '' : 'mt-auto'}`}>
        {startState ? <ChatInputStart
          prompt={prompt}
          setPrompt={setPrompt}
          onSend={handleSend}
        /> : <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSend={handleSend}
        />}
      </div>
    </div>
  )
}

export default ChatInterface
