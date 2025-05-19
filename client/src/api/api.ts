import axios from "axios";
import type { Message } from "../types/types";

export const api = axios.create({
	baseURL: "http://localhost:3000/api",
    headers: {
		"Content-Type": "application/json",
	},
});

export const getTest = async () => {
    const response = await api.get("/test");
    return response.data;
};

export const postChat = async (messages: Message[]) => {
    console.log("Sending messages to server: ", messages);
    const response = await api.post("/chat", { messages });
    return response.data;
};
