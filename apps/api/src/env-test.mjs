import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve("../../.env");
console.log("Testing path:", envPath);

dotenv.config({ path: envPath });

console.log("MONGO:", process.env.MONGODB_URI);
console.log("DB:", process.env.DB_NAME);
console.log("LLM:", process.env.LLM_ENDPOINT_URL);
