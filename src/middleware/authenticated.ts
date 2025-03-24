import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request & { userId?: number }, res: Response, next: NextFunction) => {
	try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

		const decoded = jwt.verify(token, "secretkey");

        if (typeof decoded !== 'string') {
            req.userId = decoded.id as number;
        }

		next();
	} catch {
		return res.status(401).json({ message: "Invalid token" });
	}
};

export default authMiddleware;
