import { z } from "zod";

/**
 * Portable POS sync contracts.
 *
 * This folder only depends on `zod` (no project path aliases) so it can be
 * copied verbatim into the Electron POS project to keep both sides of the sync
 * in lockstep. Do not import anything from `#/...` here.
 */

/** Current POS sync API version. The routes live under `/api/pos/{version}`. */
export const POS_API_VERSION = "v1";

/** Machine-readable error codes returned by the POS sync API. */
export const POS_ERROR_CODES = [
	"UNAUTHORIZED",
	"DEVICE_REVOKED",
	"BRANCH_INACTIVE",
	"INVALID_PAIRING_CODE",
	"VALIDATION_ERROR",
	"INTERNAL",
] as const;

export const posErrorCodeSchema = z.enum(POS_ERROR_CODES);
export type PosErrorCode = z.infer<typeof posErrorCodeSchema>;

/** Uniform error envelope for every non-2xx POS API response. */
export const posApiErrorSchema = z.object({
	error: z.object({
		code: posErrorCodeSchema,
		message: z.string(),
	}),
});

export type PosApiError = z.infer<typeof posApiErrorSchema>;

/** ISO-8601 datetime string shared across request/response payloads. */
export const isoDateTimeSchema = z.string().datetime({ offset: true });

/** Branch summary embedded in pair and pull responses. */
export const branchSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	address: z.string().nullable(),
	active: z.boolean(),
});

export type BranchSummary = z.infer<typeof branchSummarySchema>;

/** Device summary embedded in pull/device responses. */
export const deviceSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.enum(["pending", "active", "revoked"]),
});

export type DeviceSummary = z.infer<typeof deviceSummarySchema>;
