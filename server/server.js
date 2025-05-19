const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

app.post("/api/chat", async (req, res) => {
	// Testing (return text from testing-response.txt)
	res.json({ llmResponse: fs.readFileSync("testing-response.txt", "utf8") });
	/*
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

	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		contents: geminiHistory,
	});

	console.log("Generated response: ", response.text);
	res.json({ llmResponse: response.text });
	*/
});

/* SERVER */

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
