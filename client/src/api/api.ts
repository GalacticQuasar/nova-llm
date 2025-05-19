import axios from "axios";

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

export const postChat = async (message: string) => {
    const response = await api.post("/chat", { message });
    return response.data;
};
