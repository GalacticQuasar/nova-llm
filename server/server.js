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
	// const time = new Date().toLocaleTimeString("en-US", { timeZone: location });
	return "The current time is 1:42 PM";
};

const geminiConfig = {
	model: "gemini-2.0-flash",
	systemInstruction: "You are Nova, a knowldegeable and professional assistant.",
	functionDeclarations: [{
		name: "get_time",
		description: "Get the current time",
		parameters: {
			type: Type.OBJECT,
			properties: {
				location: {
					type: Type.STRING,
					description: "The location to get the time for",
				},
			},
		},
	}],
};

async function handleFunctionCall(functionCall) {
	if (functionCall.name === "get_time") {
		return await getTime(functionCall.parameters);
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

	// Convert messages to Gemini chat history format
	const geminiHistory = req.body.messages.map(message => ({
		role: message.role,
		parts: [{ text: message.content }],
	}));

	const response = await ai.models.generateContent({
		model: geminiConfig.model,
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

		if (req.body.messages.length === 0) {
			res.status(400).json({ error: "No messages received" });
			return;
		}

		// Convert messages to Gemini chat history format
		const geminiHistory = req.body.messages.map(message => ({
			role: message.role,
			parts: [{ text: message.content }],
		}));

		let response = await ai.models.generateContentStream({
			model: geminiConfig.model,
			contents: geminiHistory,
			config: {
				systemInstruction: geminiConfig.systemInstruction,
				tools: [{ functionDeclarations: geminiConfig.functionDeclarations }],
			},
		});
		
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Transfer-Encoding', 'chunked');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		let hasFunctionCall = false;
		let functionCall = null;
		while (true) {
			console.log("Streaming response:");
			for await (const chunk of response) {
				if (chunk.functionCalls) {
					console.log("Function call: ", chunk.functionCalls[0]);
					hasFunctionCall = true;
					functionCall = chunk.functionCalls[0];
					break;
				}

				process.stdout.write(chunk.text);
				res.write(chunk.text);
			}

			if (hasFunctionCall) {
				//const functionCall = chunk.functionCalls[0];

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
					model: geminiConfig.model,
					contents: geminiHistory,
					config: {
						systemInstruction: geminiConfig.systemInstruction,
						tools: [{ functionDeclarations: geminiConfig.functionDeclarations }],
					},
				});

				hasFunctionCall = false; // Reset for next iteration
			} else {
				break;
			}
		}

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
