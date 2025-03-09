import bcryptjs from 'bcryptjs';
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

import User from '../models/User';

export const registerUser = async (req: Request, res: Response) => {
	const username = req.body.username;
	const email = req.body.email;
	const password = await bcryptjs.hash(req.body.password, 12);

	const userExists = await User.findOne({
		where: {
			email: email,
		},
	});

	if (!userExists) {
		const user = await User.create({
			email: email,
			password: password,
			username: username,
		});

		const token = jwt.sign({ email: user.email, id: user.id }, "secretkey");
		res.status(200).json({
			user: {
				id: user.id,
				image: user.image,
				token: token,
				username: user.username,
			},
		});
	} else {
		res.status(401).json({
			message: "Authentication failed",
		});
	}
};

export const loginUser = (req: Request, res: Response) => {
    res.status(200);
};

/*const loginUser = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    const userExists = await User.findOne({
        where: {
            email: email
        }
    })

    if (userExists) {
        bcrypt.compare(password, userExists.password, (error, result) => {
            if (result) {
                const token = jwt.sign({ email: userExists.email, id: userExists.id }, 'secretkey')
                res.status(200).json({
                    user: {
                        id: userExists.id,
                        image: userExists.image,
                        token: token,
                        username: userExists.username
                    }
                })
            } else {
                res.status(401).json({
                    message: 'Authentication failed'
                })
            }
        })
    } else {
        res.status(401).json({
            message: 'Authentication failed'
        })
    }

}*/
