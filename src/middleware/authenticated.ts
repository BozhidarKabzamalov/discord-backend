import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.header("Authorization")?.split(" ")[1];

	if (!token) {
		res.status(401).json({ message: "Unauthorized" });
        return;
	}

	try {
		const decoded = jwt.verify(token, 'secretkey');
		req.user = decoded;
		next();
	} catch {
		res.status(401).json({ message: "Invalid token" });
        return;
	}
};

export default authMiddleware;
