import { z } from "zod";

const serverSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_WAITLIST_FORM_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), "Waitlist URL must use HTTPS")
    .optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/** Validates server-only env vars. Call from API routes / server modules. */
export function getServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment: ${fields}`);
  }
  return parsed.data;
}

/** Validates optional client env at build/runtime (non-throwing for optional vars). */
export function parseClientEnv() {
  const waitlist = process.env.NEXT_PUBLIC_WAITLIST_FORM_URL;
  return clientSchema.safeParse({
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_WAITLIST_FORM_URL: waitlist || undefined,
  });
}
