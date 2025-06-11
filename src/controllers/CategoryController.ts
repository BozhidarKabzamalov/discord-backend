import { Request, Response } from "express";

import Category from "../models/Category";
import Channel from "../models/Channel";
import Server from "../models/Server";

interface CreateCategoryRequestBody {
	name: string;
}

export const createCategory = async (
	req: Request<{ serverId: string }, null, CreateCategoryRequestBody>,
	res: Response
) => {
	const { serverId: serverIdParam } = req.params;
	const { name } = req.body;

	const serverId = parseInt(serverIdParam, 10);

	if (isNaN(serverId)) {
		return res.status(400).json({ message: "Invalid Server ID format." });
	}

	if (!name || typeof name !== "string" || name.trim() === "") {
		return res.status(400).json({
			message:
				"Category name is required and must be a non-empty string.",
		});
	}

	try {
		const server = await Server.findByPk(serverId);

		if (!server) {
			return res.status(404).json({ message: `Server not found.` });
		}

		const newCategory = await Category.create({
			name: name.trim(),
			serverId: serverId,
		});

		const newCategoryWithChannels = await Category.findByPk(
			newCategory.id,
			{
				include: [
					{
						as: "channels",
						model: Channel,
					},
				],
			}
		);

		return res.status(201).json({
			category: newCategoryWithChannels,
			message: "Category created successfully",
		});
	} catch (error) {
		console.error("Error creating category:", error);
		return res.status(500).json({ message: "Failed to create category." });
	}
};

interface UpdateCategoryRequestBody {
	name: string;
}

export const updateCategory = async (
	req: Request<
		{ categoryId: string; serverId: string },
		null,
		UpdateCategoryRequestBody
	>,
	res: Response
) => {
	const { categoryId: categoryIdParam, serverId: serverIdParam } = req.params;
	const { name } = req.body;
	const serverId = parseInt(serverIdParam, 10);
	const categoryId = parseInt(categoryIdParam, 10);

	if (isNaN(serverId) || isNaN(categoryId)) {
		return res
			.status(400)
			.json({ message: "Invalid Server ID or Category ID format." });
	}

	if (!name || typeof name !== "string" || name.trim() === "") {
		return res.status(400).json({
			message:
				"New category name is required and must be a non-empty string.",
		});
	}

	try {
		const categoryToUpdate = await Category.findOne({
			where: {
				id: categoryId,
				serverId: serverId,
			},
		});

		if (!categoryToUpdate) {
			return res.status(404).json({
				message: `Category not found in server, or server does not exist.`,
			});
		}

		categoryToUpdate.name = name.trim();

		await categoryToUpdate.save();

		return res.status(200).json({
			category: categoryToUpdate,
			message: "Category updated successfully",
		});
	} catch (error) {
		console.error("Error updating category:", error);
		return res.status(500).json({ message: "Failed to update category." });
	}
};

export const deleteCategory = async (
	req: Request<{ categoryId: string; serverId: string }, null, null>,
	res: Response
) => {
	const { categoryId: categoryIdParam, serverId: serverIdParam } = req.params;

	const serverId = parseInt(serverIdParam, 10);
	const categoryId = parseInt(categoryIdParam, 10);

	if (isNaN(serverId) || isNaN(categoryId)) {
		return res
			.status(400)
			.json({ message: "Invalid Server ID or Category ID format." });
	}

	try {
		const categoryToDelete = await Category.findOne({
			where: {
				id: categoryId,
				serverId: serverId,
			},
		});

		if (!categoryToDelete) {
			return res.status(404).json({
				message: `Category not found in server, or server does not exist.`,
			});
		}

		await categoryToDelete.destroy();

		return res
			.status(200)
			.json({ message: "Category deleted successfully" });
	} catch (error) {
		console.error("Error deleting category:", error);
		return res.status(500).json({ message: "Failed to delete category." });
	}
};
