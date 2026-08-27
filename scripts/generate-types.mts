// Workaround for a Node 20.19+ / payload-CLI incompatibility on this
// machine (tsx's CJS transform mis-handles @next/env's __esModule flag,
// and the plain CLI config isn't a fully-initialized Payload instance).
// Booting a real Payload instance via getPayload() and generating types
// from its resolved config sidesteps both issues.
process.loadEnvFile(new URL("../.env", import.meta.url));

import { generateTypes } from "../node_modules/payload/dist/bin/generateTypes.js";
import { getPayload } from "payload";
import config from "../src/payload.config.ts";

const payload = await getPayload({ config });
await generateTypes(payload.config);
process.exit(0);
