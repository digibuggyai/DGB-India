import "./load-env.mts";
import { generateTypes } from "../node_modules/payload/dist/bin/generateTypes.js";
import { getPayload } from "payload";
import importedConfig from "../src/payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

const payload = await getPayload({ config });
await generateTypes(payload.config);
process.exit(0);
