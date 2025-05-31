import { Router } from "express";

import {
	createCategory,
	deleteCategory,
	updateCategory,
} from "../controllers/CategoryController";
import authenticated from "../middleware/authenticated";
import checkRole from "../middleware/checkRole";

const router = Router();

router.post(
	"/servers/:serverId/categories",
	authenticated,
	checkRole(["owner", "admin"]),
	createCategory
);

router.put(
	"/servers/:serverId/categories/:categoryId",
	authenticated,
	checkRole(["owner", "admin"]),
	updateCategory
);

// DELETE /api/servers/:serverId/categories/:categoryId
router.delete(
	"/servers/:serverId/categories/:categoryId",
	authenticated,
	checkRole(["owner", "admin"]),
	deleteCategory
);

export default router;
