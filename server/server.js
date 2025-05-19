const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const GoogleGenAI = require("@google/genai");

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
	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		contents: "How does AI work?",
	  });
	  console.log("Generated response: ", response.text);
	res.json({ response: response.text });
});

/* SERVER */

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
