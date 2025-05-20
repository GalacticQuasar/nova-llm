import axios from "axios";
import type { Message } from "../types/types";

export const api = axios.create({
	baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
    headers: {
		"Content-Type": "application/json",
	},
});

export const getTest = async () => {
    const response = await api.get("/test");
    return response.data;
};

export const postChat = async (messages: Message[]) => {
    try {
        const response = await api.post("/chat", { messages });
        return response.data;
    } catch (error) {
        console.error("Error posting chat:", error);
        throw error;
    }
};

export const postStream = async (messages: Message[]) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
        });
        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Return the stream from the response body
        return response.body;
    } catch (error) {
        console.error("Error streaming response:", error);
        throw error;
    }
};
