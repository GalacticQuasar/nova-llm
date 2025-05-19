import { useEffect, useState } from 'react'
import { postChat } from '@/api/api'
import { ChatInputStart } from "@/components/chat-input-start"
import { ChatInput } from "@/components/chat-input"

type Message = {
  role: 'user' | 'llm'
  content: string
}

function ChatInterface() {
  const [startState, setStartState] = useState(true)
  const [faded, setFaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const transitionDuration = 200

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    if (startState) {
      setFaded(true)
      setTimeout(() => setStartState(false), transitionDuration) // wait for fade duration
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

  useEffect(() => {
    // If startState is turning from true to false, simulate a click on the ChatInput to focus on textarea
    if (!startState) {
      const chatInput = document.getElementById('chat-input-container')
      if (chatInput) {
        chatInput.click()
      }

      setFaded(false)
    }
  }, [startState])
  
  return (
    <div className={`dark text-teal-50 flex flex-col ${startState ? 'items-center' : ''} justify-center h-screen`}>
      <div className={`${startState ? '' : 'flex-1 overflow-y-auto'}`}>
        {(!startState && isLoading) && <div className="mt-4 text-center text-gray-500">Loading...</div>}
        {(!startState && response) && <div className="mt-4 text-center text-gray-500"><p>{response}</p></div>}
      </div>
      {startState && <h1 id="welcome-message" className={`text-center text-6xl font-serif flex items-center gap-4 transition-opacity duration-${transitionDuration} ${faded ? 'opacity-0' : 'opacity-100'}`}>
        <img src="/Galactic-Logo.png" alt="Galactic Logo" className="h-16 w-16" />
        <span className="text-teal-300">Welcome,</span> User
      </h1>}
      <div className={`flex justify-center ${startState ? '' : 'mt-auto'} transition-opacity duration-${transitionDuration} ${faded ? 'opacity-0' : 'opacity-100'}`}>
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
