import { useEffect, useState, useRef, useMemo, memo } from 'react'
import { postChat } from '@/api/api'
import { ChatInputStart } from "@/components/chat-input-start"
import { ChatInput } from "@/components/chat-input"
import type { Message } from "@/types/types"
import MarkdownRenderer from "@/components/MarkdownRenderer"

// Memoized message component to prevent unnecessary re-renders
const ChatMessage = memo(({ message, isLast }: { message: Message, isLast: boolean }) => {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end px-4' : `${isLast ? 'min-h-[calc(100dvh-120px)]' : ''}`}`}
    >
      <div
        className={`px-4 py-2 text-white ${
          message.role === 'user'
            ? 'bg-secondary border-[1px] border-teal-300 shadow-teal-300/20 shadow-md max-w-[80%] rounded-lg'
            : 'max-w-full'
        }`}
      >
        {message.role === 'user' ? (
          <p className="break-words">{message.content}</p>
        ) : (
          <MarkdownRenderer markdown={message.content} />
        )}
      </div>
    </div>
  )
})

// Memoized message list component
const MessageList = memo(({ messages, isLoading }: { messages: Message[], isLoading: boolean }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [isLoading])

  return (
    <div className="max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div className="pt-6" ref={(index === messages.length - 1) ? messagesEndRef : null}>
          <ChatMessage 
          key={index} 
          message={message} 
          isLast={index != 1 && index === messages.length - 1}
          />
        </div>
      ))}
      {isLoading && (
        <div className={`flex justify-start ${messages.length > 2 ? 'min-h-[calc(100dvh-120px)]' : ''}`}>
          <div className="px-4 py-2">
           <p>Thinking...</p>
          </div>
        </div>
      )}
    </div>
  )
})

function ChatInterface() {
  const [startState, setStartState] = useState(true)
  const [faded, setFaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const transitionDuration = 200

  // Memoize the message list to prevent unnecessary re-renders
  const messageList = useMemo(() => (
    <MessageList messages={messages} isLoading={isLoading} />
  ), [messages, isLoading])

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

  return (
    <div className={`font-serif dark text-teal-50 flex flex-col ${startState ? 'items-center' : ''} justify-center h-screen`}>
      <div className={`${startState ? '' : 'flex-1 overflow-y-auto pl-4 pr-2 pt-6'}`}>
        {!startState && messageList}
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
