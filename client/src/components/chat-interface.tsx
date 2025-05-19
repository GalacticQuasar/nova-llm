import { useEffect, useState } from 'react'
import { postChat } from '@/api/api'
import { ChatInputStart } from "@/components/chat-input-start"
import { ChatInput } from "@/components/chat-input"
import type { Message } from "@/types/types"

function ChatInterface() {
  const [startState, setStartState] = useState(true)
  const [faded, setFaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const transitionDuration = 200

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    if (startState) {
      setFaded(true)
      setTimeout(() => setStartState(false), transitionDuration) // wait for fade duration
    }

    // Create updated messages array
    const updatedMessages: Message[] = [...messages, { role: 'user' as const, content: prompt }];
    
    // Update state with new messages
    setMessages(updatedMessages);
    setPrompt('');

    setIsLoading(true);
    try {
      const response = await postChat(updatedMessages)
      console.log(response.llmResponse)
      setMessages(prev => [...prev, { role: 'model' as const, content: response.llmResponse }])
    } catch (error) {
      setIsError(true)  //TODO: Add error message with toast, maybe option to try again since message is saved in messages array
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

  useEffect(() => {
    console.log(messages)
  }, [messages])
  
  return (
    <div className={`dark text-teal-50 flex flex-col ${startState ? 'items-center' : ''} justify-center h-screen`}>
      <div className={`${startState ? '' : 'flex-1 overflow-y-auto pl-4 pr-2 py-6'}`}> {/* Compensate for scrollbar width */}
        {!startState && (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-700 text-teal-50'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-teal-50 rounded-lg px-4 py-2">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
          </div>
        )}
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
