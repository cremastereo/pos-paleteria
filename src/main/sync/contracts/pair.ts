import { z } from "zod";
import { branchSummarySchema } from "./common";

/**
 * Sent by the POS the first time it is configured. The pairing code is the
 * one-time code generated in the admin UI for a device.
 */
export const pairRequestSchema = z.object({
	pairingCode: z.string().min(1),
	device: z
		.object({
			platform: z.string().optional(),
			hostname: z.string().optional(),
			appVersion: z.string().optional(),
		})
		.optional(),
});

export type PairRequest = z.infer<typeof pairRequestSchema>;

/**
 * Returned once on successful pairing. `deviceToken` must be stored securely by
 * the POS (e.g. Electron `safeStorage`) and sent as a Bearer token afterwards.
 * It is never retrievable again.
 */
export const pairResponseSchema = z.object({
	deviceId: z.string(),
	deviceToken: z.string(),
	branch: branchSummarySchema,
});

export type PairResponse = z.infer<typeof pairResponseSchema>;
