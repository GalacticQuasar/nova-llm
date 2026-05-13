import { useEffect, useState, useRef, useMemo, memo } from 'react'
import { postStream } from '@/api/api'
import { ChatInputStart } from "@/components/chat-input-start"
import { ChatInput } from "@/components/chat-input"
import type { Message, ToolCallInfo } from "@/types/types"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { toast } from "sonner"
import { Copy, Loader, Wrench } from 'lucide-react'
import { useConfig } from '@/contexts/config-context'

function ToolCallBadge({ toolCall }: { toolCall: ToolCallInfo }) {
  const argsStr = Object.entries(toolCall.args)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ')
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 my-1 rounded-sm bg-teal-900/40 border border-teal-700/50 text-teal-300 text-sm font-mono">
      <Wrench size={12} />
      <span className="font-semibold">{toolCall.name}</span>
      {argsStr && <span className="text-teal-400/80">({argsStr})</span>}
    </span>
  )
}

// Memoized message component to prevent unnecessary re-renders
const ChatMessage = memo(({ message, isLast, streamingToolCalls }: { message: Message, isLast: boolean, streamingToolCalls?: ToolCallInfo[] }) => {
  const toolCalls = message.toolCalls || streamingToolCalls || []
  return (
    <div
      className={`${message.role === 'user' ? '' : `${isLast ? 'min-h-[calc(100dvh-140px)]' : ''}`}`}
    >
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`text-white ${
          message.role === 'user'
          ? 'px-4 py-2 bg-secondary border-[1px] border-teal-300 shadow-teal-300/20 shadow-md max-w-[80%] rounded-lg'
          : 'max-w-full'
          }`}
        >
          {message.role === 'user' ? (
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
          ) : (
          <>
            {toolCalls.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {toolCalls.map((tc, i) => (
                  <ToolCallBadge key={`tc-${i}`} toolCall={tc} />
                ))}
              </div>
            )}
            {message.content && <MarkdownRenderer markdown={message.content} />}
          </>
          )}
        </div>
      </div>
      <div className={`flex ${message.role === 'user' ? 'justify-end pt-4 pb-2' : 'justify-start pt-2'} group`}>
        <Copy
          className="text-teal-300 cursor-pointer hover:text-teal-500 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
          onClick={() => {
            navigator.clipboard.writeText(message.content.trim())
            toast.success('Message copied to clipboard!')
          }}
          size={16}
        />
      </div>
    </div>
  )
})

// Memoized message list component
const MessageList = memo(({ messages, isLoading, streamingResponse, streamingToolCalls }: { messages: Message[], isLoading: boolean, streamingResponse: string, streamingToolCalls: ToolCallInfo[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto scroll to user message or, if user message is too long, scroll to loading message

    if (isLoading) {
      const lastMessage = messagesEndRef.current
      const loadingMessage = loadingRef.current
      
      if (lastMessage && loadingMessage) {
        // Check if the last message height is more than 50vh
        const lastMessageHeight = lastMessage.getBoundingClientRect().height
        const viewportHeight = window.innerHeight
        
        // If the last message is taller than half the viewport, scroll to loading
        if (lastMessageHeight > viewportHeight * 0.5) {
          // We can find the nearest scrollable ancestor.
          const scrollableParent = loadingMessage.closest('.overflow-y-auto');

          if (scrollableParent) {
            const loadingMessageRect = loadingMessage.getBoundingClientRect();
            const parentRect = scrollableParent.getBoundingClientRect();

            // This is the current scroll position of the parent + the distance from the parent's top edge to the element's top edge - the offset.
            const targetScrollTop = scrollableParent.scrollTop + loadingMessageRect.top - parentRect.top - 60;

            scrollableParent.scrollTo({
              top: targetScrollTop,
              behavior: "smooth"
            });
          } else {
            // Fallback to default scrollIntoView if scrollable parent not found
            loadingMessage.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          lastMessage.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }
    }
  }, [isLoading])

  return (
    <div className="max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div key={`message-${index}`} className={`px-2 ${message.role == 'user' ? 'pt-4' : ''}`} ref={(index === messages.length - 1) ? messagesEndRef : null}>
          <ChatMessage 
            message={message} 
            isLast={index != 1 && index === messages.length - 1}
          />
        </div>
      ))}
      {streamingResponse && (
        <div key="streaming-response" className="px-2">
          <ChatMessage 
            message={{ role: 'model', content: streamingResponse }}
            isLast={messages.length > 2}
            streamingToolCalls={streamingToolCalls}
          />
        </div>
      )}
      {isLoading && !streamingResponse && (
        <div key="loading" ref={loadingRef} className={`flex justify-start px-2 pt-1 ${messages.length > 2 ? 'min-h-[calc(100dvh-140px)]' : ''}`}>
          <Loader className="animate-spin text-teal-300" size={20} />
        </div>
      )}
    </div>
  )
})

function ChatInterface() {
  const { config } = useConfig()
  const [startState, setStartState] = useState(true)
  const [faded, setFaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  //const [isError, setIsError] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState("")
  const [streamingToolCalls, setStreamingToolCalls] = useState<ToolCallInfo[]>([])
  const collectedToolCalls = useRef<ToolCallInfo[]>([])
  const abortController = useRef<{ aborted: boolean }>({ aborted: false });

  const transitionDuration = 200

  // Memoize the message list to prevent unnecessary re-renders
  const messageList = useMemo(() => (
    <MessageList messages={messages} isLoading={isLoading} streamingResponse={streamingResponse} streamingToolCalls={streamingToolCalls} />
  ), [messages, isLoading, streamingResponse, streamingToolCalls])

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
    abortController.current.aborted = false;

    setIsLoading(true);
    setStreamingToolCalls([]);
    collectedToolCalls.current = [];
    try {
      const stream = await postStream(updatedMessages, config);
      if (!stream) throw new Error('No stream received');

      // Choose stream animation type based on config in localstorage
      const streamType = config.streamType ? config.streamType : 'Chunk';

      const fullResponse = await streamFunctionSelector(streamType)(stream);

      const toolCalls = collectedToolCalls.current;
      setMessages(prev => [...prev, { role: 'model' as const, content: fullResponse, toolCalls: toolCalls.length > 0 ? toolCalls : undefined }]);
      setStreamingResponse('');
    } catch (error) {
      //setIsError(true)  //TODO: Add error message with toast, maybe option to try again since message is saved in messages array
      console.error('Streaming error:', error);
      if (error instanceof Error && error.message.includes('429')) {
        toast.error('Server is busy. Please try again later.');
      } else {
        toast.error('Error streaming response. Please try again.')
      }
    } finally {
      setIsLoading(false)
      setStreamingToolCalls([])
    }
  }

  const handleStop = () => {
    console.log('Aborting...')
    abortController.current.aborted = true;
  }

  const streamFunctionSelector = (streamType: string) => {
    switch (streamType) {
      case 'Chunk':
        return streamByChunk;
      case 'Word':
        return streamByWord;
      case 'Character':
        return streamByCharacter;
      default:
        return streamByChunk;
    }
  }

  const streamByChunk = async (stream: ReadableStream<Uint8Array<ArrayBufferLike>>) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      while (!abortController.current.aborted) {
        const { done, value } = await reader.read();
        if (done || abortController.current.aborted) break;
        
        let buffer = decoder.decode(value);
        const toolCallRegex = /\n?__NOVA_TOOL_CALL__(.+?)__\n?/g;
        let toolCallMatch;
        while ((toolCallMatch = toolCallRegex.exec(buffer)) !== null) {
          try {
            const parsed = JSON.parse(toolCallMatch[1]);
            const tc = { name: parsed.name, args: parsed.args };
            setStreamingToolCalls(prev => [...prev, tc]);
            collectedToolCalls.current.push(tc);
          } catch { /* skip malformed tool call markers */ }
        }
        buffer = buffer.replace(/\n?__NOVA_TOOL_CALL__(.+?)__\n?/g, '');

        fullResponse += buffer;
        setStreamingResponse(fullResponse);
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }

  const streamByWord = async (stream: ReadableStream<Uint8Array<ArrayBufferLike>>, delay: number = 10) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    try {
      while (!abortController.current.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        if (abortController.current.aborted) break;
        
        buffer += decoder.decode(value);

        const toolCallRegex = /\n?__NOVA_TOOL_CALL__(.+?)__\n?/g;
        let toolCallMatch;
        while ((toolCallMatch = toolCallRegex.exec(buffer)) !== null) {
          try {
            const parsed = JSON.parse(toolCallMatch[1]);
            const tc = { name: parsed.name, args: parsed.args };
            setStreamingToolCalls(prev => [...prev, tc]);
            collectedToolCalls.current.push(tc);
          } catch { /* skip malformed tool call markers */ }
        }
        buffer = buffer.replace(/\n?__NOVA_TOOL_CALL__(.+?)__\n?/g, '');

        // Process complete words from the buffer, keeping original spacing
        const words = buffer.split(/(\s+)/);
        buffer = words.pop() || ''; // Keep last partial word in buffer

        for (const word of words) {
          if (abortController.current.aborted) break;
          
          // Add the word (or whitespace) to the response
          fullResponse += word;
          
          // Only add delay for actual words, not whitespace
          if (word.trim()) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          setStreamingResponse(fullResponse);
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Add any remaining text from buffer
    if (buffer) {
      fullResponse += buffer;
      setStreamingResponse(fullResponse);
    }

    return fullResponse;
  }

  const streamByCharacter = async (stream: ReadableStream<Uint8Array<ArrayBufferLike>>, delay: number = 0) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (!abortController.current.aborted) {
      const { done, value } = await reader.read();
      if (done) {
        // Add any remaining characters in buffer
        if (buffer) {
          fullResponse += buffer;
          setStreamingResponse(fullResponse);
        }
        break;
      }
      
      buffer += decoder.decode(value);

      const toolCallRegex = /\n?__NOVA_TOOL_CALL__(.+?)__\n?/g;
      let toolCallMatch;
      while ((toolCallMatch = toolCallRegex.exec(buffer)) !== null) {
        try {
          const parsed = JSON.parse(toolCallMatch[1]);
          const tc = { name: parsed.name, args: parsed.args };
          setStreamingToolCalls(prev => [...prev, tc]);
          collectedToolCalls.current.push(tc);
        } catch { /* skip malformed tool call markers */ }
      }
      buffer = buffer.replace(/\n?__NOVA_TOOL_CALL__(.+?)__\n?/g, '');

      // Process characters one at a time
      while (buffer.length > 0) {
        const char = buffer[0];
        buffer = buffer.slice(1);
        
        fullResponse += char;
        setStreamingResponse(fullResponse);
        
        // Add a small delay between characters for smoother animation
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return fullResponse;
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
      <div className={`${startState ? '' : 'flex-1 overflow-y-auto pl-4 pr-2 py-6'}`}>
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
          onStop={handleStop}
          isLoading={isLoading}
        /> : <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
        />}
      </div>
    </div>
  )
}

export default ChatInterface
