import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Supadata } from "@supadata/js";

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!,
});

async function test() {
  const result = await supadata.youtube.transcript({
    url: "https://www.youtube.com/watch?v=xwKbtUP87Dk",
  });

  console.log(JSON.stringify(result, null, 2));
}

test();