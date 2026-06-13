// test-env.ts

import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log(process.env.SUPADATA_API_KEY);