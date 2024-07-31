import { NextFunction, Request, Response } from "express";
import { ContextRunner } from "express-validator";

export const validate = (validations: ContextRunner[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		for (const validation of validations) {
			const result = await validation.run(req);
			if (!result.isEmpty()) {
				return res.status(400).json({ code: 400, success: false, errors: result.array() });
			}
		}
		return next();
	};
};
