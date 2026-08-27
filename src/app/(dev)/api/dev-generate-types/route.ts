// Temporary dev-only endpoint. Node's require(esm) semantics break the
// standalone `payload generate:types` CLI on this Node/Next combo (tsx's
// CJS transform mis-detects @next/env's __esModule flag). Running the same
// generator through Next's own module graph — which loads it correctly via
// SWC/webpack — sidesteps the bug. Delete this route once type generation
// works normally again.
import config from "@payload-config";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- deep import into payload's dist, not part of its public API
import { generateTypes } from "payload/dist/bin/generateTypes.js";

export async function GET() {
  const resolvedConfig = await config;
  await generateTypes(resolvedConfig);
  return new Response("Types generated.");
}
