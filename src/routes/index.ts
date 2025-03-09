import { Router} from "express";

const router = Router();

const todos = ['hehe', 'haha']

router.get("/", (req, res, next) => {
	res.status(200).json({ todos })
});

export default router;
