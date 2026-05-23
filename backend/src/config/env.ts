import dotenv from "dotenv";
import z = require("zod");

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  MONGO_URI: z.string(),
  REDIS_URL: z.string(),
  OPENAI_API_KEY: z.string(),
  CLIENT_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
