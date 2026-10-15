import { z } from "zod";

/**
 * POS cashier as delivered over the pull channel.
 * `passwordHash` is a bcrypt hash so the register can verify the password
 * offline. The plaintext password never leaves the admin server.
 */
export const posUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	username: z.string(),
	passwordHash: z.string(),
	active: z.boolean(),
	branchIds: z.array(z.string()),
	createdAt: z.string().datetime({ offset: true }),
	updatedAt: z.string().datetime({ offset: true }),
});

export type PosUserPayload = z.infer<typeof posUserSchema>;
