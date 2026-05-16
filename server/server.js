import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from 'url';
import path from 'path';

// Configure __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pull environment variables
dotenv.config();

// Set up AI stuff

// MCP server configurations
const mcpServers = {
	"sequential-thinking": {
		command: "node",
		args: [path.join(__dirname, "node_modules", "@modelcontextprotocol", "server-sequential-thinking", "dist", "index.js")],
		client: new Client({ name: "sequential-thinking-client", version: "1.0.0" }),
	},
	"weather": {
		command: "node",
		args: [path.join(__dirname, "node_modules", "@dangahagan", "weather-mcp", "dist", "index.js")],
		client: new Client({ name: "weather-client", version: "1.0.0" }),
	},
};

// Track which MCP servers are connected
const connectedServers = {};

// Connect to an MCP server on demand (lazy connection)
async function getMcpClient(serverName) {
	if (connectedServers[serverName]) {
		return mcpServers[serverName].client;
	}
	const server = mcpServers[serverName];
	if (!server) {
		throw new Error(`Unknown MCP server: ${serverName}`);
	}
	const transport = new StdioClientTransport({
		command: server.command,
		args: server.args,
	});
	await server.client.connect(transport);
	connectedServers[serverName] = true;
	console.log(`CONNECTED TO MCP SERVER: ${serverName}`);
	return server.client;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getTime = async (location) => {
	try {
		const time = new Date().toLocaleTimeString("en-US", { timeZone: location, hour: "2-digit", minute: "2-digit" });
		return time;
	} catch (error) {
		return `Error: Invalid timezone "${location}". Try an IANA timezone like "America/New_York".`;
	}
};

const getRandomNumber = async (min, max) => {
	const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomNumber;
};

const geminiConfig = {
	defaultModel: "gemini-2.5-flash",
	validModels: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
	systemInstruction: "You are Nova, a knowledgeable and professional assistant. You are allowed to answer general questions that may not directly pertain to tools. You are capable of making multiple tool calls at a time.",
	functionDeclarations: [{
		name: "get_time",
		description: "Get the current time",
		parameters: {
			type: Type.OBJECT,
			properties: {
				location: {
					type: Type.STRING,
					description: "The time zone (IANA timezone identifier) to get the time for",
				},
			},
			required: ["location"],
		},
	}, {
		name: "get_random_number",
		description: "Get a random number",
		parameters: {
			type: Type.OBJECT,
			properties: {
				min: {
					type: Type.NUMBER,
					description: "The minimum number to generate",
				},
				max: {
					type: Type.NUMBER,
					description: "The maximum number to generate",
				},
			},
			required: ["min", "max"],
		},
	}],
};

async function handleFunctionCall(functionCall) {
	try {
		if (functionCall.name === "get_time") {
			return await getTime(functionCall.args.location);
		}
		if (functionCall.name === "get_random_number") {
			return await getRandomNumber(functionCall.args.min, functionCall.args.max);
		}
	} catch (error) {
		console.error(`Error handling function call ${functionCall.name}:`, error);
		return null;
	}
}

// Set up express server
const app = express();
const port = process.env.PORT || 3000;

/* MIDDLEWARE */

// CORS Configuration
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
	})
);

// Static file serving
//app.use(express.static("public"));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for /api/stream endpoint - 5 requests per second globally
const streamRateLimit = rateLimit({
	windowMs: 1000, // 1 second window
	max: 5, // Limit each IP to 5 requests per windowMs
	message: {
		error: "Too many requests to the stream endpoint. Please try again later.",
		retryAfter: 1
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// Global rate limiting (applies to all IPs collectively)
	keyGenerator: () => 'global-stream-limit',
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
});

/* ROUTES */

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.get("/api/test", (req, res) => {
	res.json({ message: "Yeehaw" });
});


// Streaming endpoint
app.post("/api/stream", streamRateLimit, async (req, res) => {
	try {
		console.log("\n---------- /api/stream ----------\n")
		// Debugging logs
		// console.log("Received messages: ", req.body.messages);
		// console.log("Received config: ", req.body.config);

		if (req.body.messages.length === 0) {
			res.status(400).json({ error: "No messages received" });
			return;
		}

		// Use config from request or fallback to default
		const config = req.body.config || { model: geminiConfig.defaultModel, tools: { get_time: true, get_random_number: true }, mcpServer: "none" };

		// Validate model and fallback to default if invalid
		if (!config.model || !geminiConfig.validModels.includes(config.model)) {
			console.log(`Invalid model "${config.model}", falling back to default: ${geminiConfig.defaultModel}`);
			config.model = geminiConfig.defaultModel;
		}

		// Check if MCP is enabled, otherwise use custom tools
		let tools;
		if (config.mcpServer && config.mcpServer !== "none") {
			console.log(`MCP ENABLED: ${config.mcpServer}, not using custom tools.`);
			const mcpClient = await getMcpClient(config.mcpServer);
			tools = [mcpToTool(mcpClient)]
		} else {
			// Filter function declarations based on enabled tools
			let enabledFunctionDeclarations = geminiConfig.functionDeclarations.filter(func => {
				return config.tools && config.tools[func.name] === true;
			});
			console.log("Enabled Tools:", enabledFunctionDeclarations.map(func => func.name));
			tools = enabledFunctionDeclarations.length > 0 ? [{ functionDeclarations: enabledFunctionDeclarations }] : undefined;
		}

		// Convert messages to Gemini chat history format
		const geminiHistory = req.body.messages.map(message => ({
			role: message.role,
			parts: [{ text: message.content }],
		}));
		
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Transfer-Encoding', 'chunked');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		let functionCalls;
		do {
			const TOOL_CALL_MARKER = (data) => `\n__NOVA_TOOL_CALL__${JSON.stringify(data)}__\n`;
			console.log("Generating response...")
			const response = await ai.models.generateContentStream({
				model: config.model,
				contents: geminiHistory,
				config: {
					systemInstruction: geminiConfig.systemInstruction,
					tools: tools,
				},
			});

			functionCalls = null;
			process.stdout.write("\nStreaming response: ");
			for await (const chunk of response) {
				if (chunk.functionCalls) {
					for (const fc of chunk.functionCalls) {
						res.write(TOOL_CALL_MARKER({ name: fc.name, args: fc.args }));
					}
					console.log("\n---\tFunction calls:", chunk.functionCalls);
					if (!config.mcpServer || config.mcpServer === "none") {  // Only handle it manually if MCP mode is off (custom tools)
						if (functionCalls) {
							// add to list
							functionCalls.push(...chunk.functionCalls);
						} else {
							functionCalls = [...chunk.functionCalls];
						}
					}
					continue;
				}

				if (chunk.text) {
					process.stdout.write(chunk.text);
					res.write(chunk.text);
				}
			}

			if (functionCalls && functionCalls.length > 0) {
				for (const functionCall of functionCalls) {
					console.log("---\tHandling function call:", functionCall);
					let result = await handleFunctionCall(functionCall);
					console.log(`---\tFunction execution result: ${JSON.stringify(result)}\n`);

					const functionResponse = {
						name: functionCall.name,
						response: { result },
					};

					// Append function call and result to geminiHistory
					geminiHistory.push({
						role: "model",
						parts: [{ functionCall: functionCall }],
					});

					geminiHistory.push({
						role: "user",
						parts: [{ functionResponse: functionResponse }],
					});
				}
			}
		} while (functionCalls && functionCalls.length > 0);

		console.log("\n---------- DONE ----------");

		res.end();
	} catch (error) {
		console.error('Streaming error:', error);
		if (error.status === 429) {
			res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
			return;
		}
    	res.status(500).send('Error streaming response.');
	}
});

/* SERVER */

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
