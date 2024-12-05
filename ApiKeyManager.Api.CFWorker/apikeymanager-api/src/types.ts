import { DateTime, Str } from "chanfana";
import { z } from "zod";

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

export interface Env {
    DB: D1Database;
    FRONTEND_URL: string;
    EMAIL_SERVICE_URL: string;
}

export interface OneTimeLink {
    id: number;
    email: string;
    token: string;
    expiresAt: string;
    isUsed: boolean;
    createdAt: string;
}

export interface ApiKey {
    id: number;
    email: string;
    hashedKey: string;
    createdAt: string;
}

export interface StoreKeyRequest {
    token: string;
    hashedKey: string;
}
