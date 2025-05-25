const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI, Type } = require("@google/genai");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
	systemInstruction: "You are Nova, a knowldegeable and professional assistant.",
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
	if (functionCall.name === "get_time") {
		return await getTime(functionCall.args.location);
	}
	if (functionCall.name === "get_random_number") {
		return await getRandomNumber(functionCall.args.min, functionCall.args.max);
	}
	return null;
}

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

// Regular chat with history endpoint
app.post("/api/chat", async (req, res) => {
	const testing = false; // Remove this for production

	console.log("Received messages: ", req.body.messages);
	console.log("Received config: ", req.body.config);

	if (req.body.messages.length === 0) {
		res.status(400).json({ error: "No messages received" });
		return;
	}

	if (testing) {
		// Take 1 second to simulate realistic response time
		setTimeout(() => {
			res.json({ llmResponse: fs.readFileSync("testing-response.txt", "utf8") });
		}, 1000);
		return;
	}

	// Use config from request or fallback to default
	const config = req.body.config || { model: geminiConfig.defaultModel, tools: { get_time: true, get_random_number: true } };
	
	// Validate model and fallback to default if invalid
	if (!config.model || !geminiConfig.validModels.includes(config.model)) {
		console.log(`Invalid model "${config.model}", falling back to default: ${geminiConfig.defaultModel}`);
		config.model = geminiConfig.defaultModel;
	}
	
	console.log(`Using model: ${config.model}`);
	console.log(`Enabled tools: ${Object.entries(config.tools).filter(([_, enabled]) => enabled).map(([name, _]) => name).join(', ') || 'none'}`);

	// Convert messages to Gemini chat history format
	const geminiHistory = req.body.messages.map(message => ({
		role: message.role,
		parts: [{ text: message.content }],
	}));

	const response = await ai.models.generateContent({
		model: config.model,
		contents: geminiHistory,
		config: {
			systemInstruction: geminiConfig.systemInstruction,
		},
	});

	console.log("Generated response: ", response.text);
	res.json({ llmResponse: response.text });
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
		const config = req.body.config || { model: geminiConfig.defaultModel, tools: { get_time: true, get_random_number: true } };
		
		// Validate model and fallback to default if invalid
		if (!config.model || !geminiConfig.validModels.includes(config.model)) {
			console.log(`Invalid model "${config.model}", falling back to default: ${geminiConfig.defaultModel}`);
			config.model = geminiConfig.defaultModel;
		}
		
		console.log(`Using model: ${config.model}`);
		console.log(`Enabled tools: ${Object.entries(config.tools).filter(([_, enabled]) => enabled).map(([name, _]) => name).join(', ') || 'none'}`);

		// Filter function declarations based on enabled tools
		const enabledFunctionDeclarations = geminiConfig.functionDeclarations.filter(func => {
			return config.tools && config.tools[func.name] === true;
		});

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
				tools: enabledFunctionDeclarations.length > 0 ? [{ functionDeclarations: enabledFunctionDeclarations }] : undefined,
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
					console.log("Function call: ", chunk.functionCalls[0]);
					functionCall = chunk.functionCalls[0];
					break;
				}

				process.stdout.write(chunk.text);
				res.write(chunk.text);
			}

			if (functionCall) {
				console.log("Handling function call: ", functionCall);
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
						tools: enabledFunctionDeclarations.length > 0 ? [{ functionDeclarations: enabledFunctionDeclarations }] : undefined,
					},
				});
			}
		} while (functionCall)

		console.log("Streaming response complete");

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
