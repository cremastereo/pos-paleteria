import { z } from "zod";

/**
 * Warehouse data as delivered to the POS over the pull channel.
 * Mirror of the admin `warehouse` table (safe subset).
 */
export const warehouseSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	active: z.boolean(),
	createdAt: z.string().datetime({ offset: true }),
	updatedAt: z.string().datetime({ offset: true }),
});

export type WarehousePayload = z.infer<typeof warehouseSchema>;
