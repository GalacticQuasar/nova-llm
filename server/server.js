import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Pull environment variables
dotenv.config();

// Set up AI stuff

// Create server parameters for stdio connection
const serverParams = new StdioClientTransport({
	command: "npx", // Executable
//   args: ["-y", "@philschmid/weather-mcp"] // MCP Server
	args: ["mcp-hello-world"]
});

const client = new Client(
	{
		name: "example-client",
		version: "1.0.0"
	}
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize the connection between client and server
await client.connect(serverParams);
console.log("CONNECTED TO MCP SERVER")

const getTime = async (location) => {
	const time = new Date().toLocaleTimeString("en-US", { timeZone: location, hour: "2-digit", minute: "2-digit" });
	return time;
};

const getRandomNumber = async (min, max) => {
	const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomNumber;
};

const geminiConfig = {
	defaultModel: "gemini-2.0-flash",
	validModels: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash-preview-05-20"],
	systemInstruction: "You are Nova, a knowledgeable and professional assistant.",
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

// Enable CORS for specific origin in production, all origins in development
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? "https://your-production-domain.com" // Replace with your actual production domain
				: "http://localhost:5173", // Vite's default development server
	})
);

// Static file serving
//app.use(express.static("public"));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ROUTES */

app.get("/api/test", (req, res) => {
	res.json({ message: "Yeehaw" });
});


// Streaming endpoint
app.post("/api/stream", async (req, res) => {
	try {
		console.log("Received messages: ", req.body.messages);
		console.log("Received config: ", req.body.config);

		if (req.body.messages.length === 0) {
			res.status(400).json({ error: "No messages received" });
			return;
		}

		// Use config from request or fallback to default
		const config = req.body.config || { model: geminiConfig.defaultModel, tools: { get_time: true, get_random_number: true }, mcpEnabled: false };
		


		// Validate model and fallback to default if invalid
		if (!config.model || !geminiConfig.validModels.includes(config.model)) {
			console.log(`Invalid model "${config.model}", falling back to default: ${geminiConfig.defaultModel}`);
			config.model = geminiConfig.defaultModel;
		}
		
		console.log(`Using model: ${config.model}`);

		// Check if MCP is enabled, otherwise use custom tools
		let tools;
		if (config.mcpEnabled === true) {
			console.log("MCP ENABLED, not using custom tools.")
			tools = [mcpToTool(client)]
		} else {
			console.log(`Enabled tools: ${Object.entries(config.tools).filter(([_, enabled]) => enabled).map(([name, _]) => name).join(', ') || 'none'}`);

			// Filter function declarations based on enabled tools
			let enabledFunctionDeclarations = geminiConfig.functionDeclarations.filter(func => {
				return config.tools && config.tools[func.name] === true;
			});
			console.log("ENABLED FUNCTION DECLARATIONS:", enabledFunctionDeclarations)
			tools = enabledFunctionDeclarations.length > 0 ? [{ functionDeclarations: enabledFunctionDeclarations }] : undefined;
		}

		// Convert messages to Gemini chat history format
		const geminiHistory = req.body.messages.map(message => ({
			role: message.role,
			parts: [{ text: message.content }],
		}));

		let response = await ai.models.generateContentStream({
			model: config.model,
			contents: geminiHistory,
			config: {
				systemInstruction: geminiConfig.systemInstruction,
				tools: tools,
			},
		});
		
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Transfer-Encoding', 'chunked');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		let functionCall;
		do {
			functionCall = null;
			console.log("Streaming response:");
			for await (const chunk of response) {
				if (chunk.functionCalls) {
					console.log("Function call:", chunk.functionCalls[0]);
					if (!config.mcpEnabled) {  // Only handle it manually if MCP mode is off (custom tools)
						functionCall = chunk.functionCalls[0];
					}
					continue;
				}

				if (chunk.text) {
					process.stdout.write(chunk.text);
					res.write(chunk.text);
				}
			}

			if (functionCall) {
				console.log("Handling function call:", functionCall);
				let result = await handleFunctionCall(functionCall);
				console.log(`Function execution result: ${JSON.stringify(result)}`);

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

				response = await ai.models.generateContentStream({
					model: config.model,
					contents: geminiHistory,
					config: {
						systemInstruction: geminiConfig.systemInstruction,
						tools: tools,
					},
				});
			}
		} while (functionCall)

		console.log("\nStreaming response complete");

		res.end();
	} catch (error) {
		console.error('Streaming error:', error);
    	res.status(500).send('Error streaming response.');
	}
});

/* SERVER */

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
