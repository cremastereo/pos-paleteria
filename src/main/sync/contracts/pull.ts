import { z } from "zod";
import {
	branchSummarySchema,
	deviceSummarySchema,
	isoDateTimeSchema,
} from "./common";
import { posUserSchema } from "./modules/pos-user";
import { warehouseSchema } from "./modules/warehouse";

/**
 * A module delivered as a full snapshot: the POS replaces its local copy of
 * this entity with `data`. Simplest mode; no stale data, no local merge.
 */
export function snapshotModule<TData extends z.ZodTypeAny>(dataSchema: TData) {
	return z.object({
		mode: z.literal("snapshot"),
		/** Opaque cursor to send back on the next pull (may be null). */
		cursor: z.string().nullable(),
		data: z.array(dataSchema),
	});
}

/**
 * A module delivered incrementally: only records changed since the client
 * cursor. `upserts` are inserted/updated locally, `deletes` carry ids to drop.
 * Requires every incremental entity to track `updatedAt` and soft-deletes.
 */
export function incrementalModule<TItem extends z.ZodTypeAny>(
	itemSchema: TItem,
) {
	return z.object({
		mode: z.literal("incremental"),
		cursor: z.string().nullable(),
		upserts: z.array(itemSchema),
		deletes: z.array(z.string()),
	});
}

/**
 * The full set of modules a pull can return. Add a key here (and a matching
 * resolver in the server pull registry) for every new module.
 */
export const pullModulesSchema = z.object({
	warehouse: snapshotModule(warehouseSchema),
	posUsers: snapshotModule(posUserSchema),
});

export type PullModules = z.infer<typeof pullModulesSchema>;

/** Cursors the POS sends so the server can answer incrementally where possible. */
export const pullCursorsSchema = z
	.object({
		warehouse: z.string().nullish(),
		posUsers: z.string().nullish(),
	})
	.partial();

export type PullCursors = z.infer<typeof pullCursorsSchema>;

export const pullRequestSchema = z.object({
	cursors: pullCursorsSchema.optional(),
	/** Optional device metadata refreshed on each pull. */
	device: z
		.object({
			platform: z.string().optional(),
			hostname: z.string().optional(),
			appVersion: z.string().optional(),
		})
		.optional(),
});

export type PullRequest = z.infer<typeof pullRequestSchema>;

export const pullResponseSchema = z.object({
	serverTime: isoDateTimeSchema,
	device: deviceSummarySchema,
	branch: branchSummarySchema,
	modules: pullModulesSchema,
});

export type PullResponse = z.infer<typeof pullResponseSchema>;
