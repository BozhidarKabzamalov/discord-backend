import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User";

interface loginUserRequestBodyType {
    email: string;
    password: string;
}

interface registerUserRequestBodyType extends loginUserRequestBodyType {
    username: string;
}

export const registerUser = async (
    req: Request<null, null, registerUserRequestBodyType>,
    res: Response,
) => {
    try {
        const { email, password, username } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userAlreadyExists = await User.findOne({
            where: {
                email,
            },
        });

        if (userAlreadyExists) {
            return res.status(409).json({
                error: "User already exists",
            });
        }

        const user = await User.create({
            email: email,
            password: hashedPassword,
            username: username,
        });

        const token = jwt.sign({ email: user.email, id: user.id }, "secretkey");

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                token: token,
                username: user.username,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (
    req: Request<null, null, loginUserRequestBodyType>,
    res: Response,
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExists = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!userExists) {
            return res.status(401).json({
                message: "Authentication failed",
            });
        }

        const isMatch = await bcrypt.compare(password, userExists.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Authentication failed",
            });
        }

        const token = jwt.sign(
            { email: userExists.email, id: userExists.id },
            "secretkey",
        );

        return res.status(200).json({
            user: {
                email: userExists.email,
                id: userExists.id,
                token: token,
                username: userExists.username,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
