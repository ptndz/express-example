export const __prod__ = process.env.NODE_ENV === "production";
export const ORIGIN = __prod__
	? ["*"]
	: [
			"http://localhost:4001",
			"http://localhost:3000",
			"https://server1.test",
			"http://server1.test",
	  ];

export const DAY_TIME = 60 * 60 * 24;
export const PERMISSIONS_ACTIONS = ["list", "create", "detail", "update", "delete"];
