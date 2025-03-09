import { Router} from "express";

const router = Router();

const users = ["Bozhidar", "George"]

router.get("/", (req, res, next) => {
    res.status(200).json({ users });
});

export default router;