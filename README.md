# Nova LLM

A full-stack LLM agent workflow with custom tool calling capabilities and configuration with MCP servers.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8a0a6b6c-ec05-4dec-af77-1682df1a8d7f" />

## Features

- **Model Context Protocol (MCP)**: Extensible tool system for enhanced AI capabilities
- **Custom Function Tools**: Example time and random number generation functions
- **Real-time Streaming**: Choose from chunk, word-by-word, or character-by-character streaming animations
- **Tool Call Visibility**: Inline badges show tool name and arguments in real-time during streaming
- **Markdown rendering**: Real-time markdown rendering during generation
- **Copy Messages**: One-click copying of any message to clipboard
- **Chat Persistence**: Chats are saved to IndexedDB and persist across sessions with recent chats in the sidebar
- **Configurable Settings**: Easy model switching and tool configuration for each message

## Architecture

### Frontend (Client)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui components with custom styling
- **State Management**: React Context for configuration and chat state
- **Persistence**: IndexedDB for client-side chat storage
- **Markdown Rendering**: Full markdown support with syntax highlighting

### Backend (Server)
- **Runtime**: Node.js with Express
- **LLM Provider**: Google GenAI SDK
- **MCP Support**: Model Context Protocol client for extensible tools
- **Streaming**: Chunked HTTP streaming for real-time responses with tool call markers

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GalacticQuasar/nova-llm.git
   cd nova-llm
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file in server directory
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   echo "PORT=3000" >> .env
   ```

4. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server** (from server directory)
   ```bash
   npm start
   # or for development with auto-reload
   npm run watch
   ```

2. **Start the client** (from client directory)
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

## Configuration

### Streaming Animation
Customize how responses appear:
- **Chunk**: Instant text blocks (fastest)
- **Word**: Word-by-word animation (balanced)
- **Character**: Character-by-character typing effect (smoothest)

### Function Tools
Enable/disable built-in functions:
- **Get Time**: Current time in specified timezone
- **Get Random Number**: Random number generation within range

> Note: You can add or change these tools, see [Adding Custom Tools](#adding-custom-tools)

### Model Context Protocol (MCP)
Toggle MCP mode to use external tool servers for extended functionality.

## Development

### Project Structure

```
nova-llm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts (config, chat)
│   │   ├── hooks/          # Custom hooks
│   │   ├── api/            # API client
│   │   ├── lib/            # Utilities (IndexedDB wrapper)
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
└── server/                 # Express backend
    ├── server.js           # Main server file
    └── package.json        # Server dependencies
```

### Adding Custom Tools

1. **Define the function** in `server.js`:
   ```javascript
   const myCustomFunction = async (param1, param2) => {
     // Your implementation
     return result;
   };
   ```

2. **Add function declaration** to `geminiConfig`:
   ```javascript
   {
     name: "my_custom_function",
     description: "Description of what it does",
     parameters: {
       type: Type.OBJECT,
       properties: {
         param1: {
           type: Type.STRING,
           description: "Parameter description",
         },
       },
     },
   }
   ```

3. **Add the function call in the `handleFunctionCall` handler**:
   ```javascript
    async function handleFunctionCall(functionCall) {
        try {
            if (functionCall.name === "get_time") {
                return await getTime(functionCall.args.location);
            }
            if (functionCall.name === "get_random_number") {
                return await getRandomNumber(functionCall.args.min, functionCall.args.max);
            }
            // ADD YOUR FUNCTION CALL HERE IN THE HANDLER
            if (functionCall.name === "my_custom_function") {
                return await myCustomFunction(functionCall.args.param1, functionCall.args.param2);
            }
        } catch (error) {
            console.error(`Error handling function call ${functionCall.name}:`, error);
            return null;
        }
    }
   ```

## Model Context Protocol (MCP)

Nova LLM supports MCP for extensible tool integration. MCP servers can be configured in the server initialization:

```javascript
const serverParams = new StdioClientTransport({
  command: "npx",
  args: ["your-mcp-server-package"]
});
```

When MCP mode is enabled, custom function tools are disabled in favor of MCP-provided tools.

## API Reference

### POST `/api/stream`

Stream chat responses from Gemini models.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user|model",
      "content": "Message content"
    }
  ],
  "config": {
    "model": "<gemini-model-id>",
    "tools": {
      "get_time": true,
      "get_random_number": false
    },
    "mcpEnabled": false,
    "streamType": "Word"
  }
}
```

**Response:** Chunked HTTP stream with text chunks. When the model makes a function call, a marker line is injected into the stream:

```
__NOVA_TOOL_CALL__{"name":"get_time","args":{"location":"America/New_York"}}__
```

The client parses these markers in real-time, displays them as inline tool call badges, and strips them from the visible text.
