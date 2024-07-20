export const __prod__ = process.env.NODE_ENV === "production";
export const ORIGIN = __prod__
	? ["*"]
	: ["http://localhost:4001", "https://server1.test", "http://server1.test"];
