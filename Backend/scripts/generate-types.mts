// Workaround for a Node 20.19+ / payload-CLI incompatibility on this
// machine: `.ts` files are loaded through tsx's CJS-compatible transform
// (this package.json has no "type": "module"), which double-wraps a plain
// `export default` as `{ default: theRealConfig }` when re-imported from a
// genuine ESM entrypoint. Unwrap defensively, then boot a real Payload
// instance so generateTypes gets a fully-resolved config (db adapter etc).
import "./load-env.mts";
import { generateTypes } from "../node_modules/payload/dist/bin/generateTypes.js";
import { getPayload } from "payload";
import importedConfig from "../src/payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

const payload = await getPayload({ config });
await generateTypes(payload.config);
process.exit(0);
