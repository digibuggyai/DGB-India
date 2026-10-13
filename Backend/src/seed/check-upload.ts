import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

/** A real 2×2 PNG, so sharp has something valid to resize. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFElEQVR4nGP8z/CfAQ0woYsMLUEAZkwBD2YUpBwAAAAASUVORK5CYII=",
  "base64",
);

async function main() {
  const payload: any = await getPayload({ config });

  console.log("storage:", process.env.S3_BUCKET ? "S3 bucket" : "local disk (media/)");
  console.log("cwd    :", process.cwd());

  let created: any = null;
  try {
    created = await payload.create({
      collection: "media",
      data: { alt: "upload check" },
      file: { data: PNG, mimetype: "image/png", name: `upload-check-${Date.now()}.png`, size: PNG.length },
      overrideAccess: true,
    });
    console.log(`\nok — uploaded #${created.id} as ${created.filename}`);
    console.log("   url   :", created.url);
    console.log("   sizes :", Object.keys(created.sizes ?? {}).join(", ") || "(none)");
  } catch (err: any) {
    console.error("\nFAILED:", err?.message ?? err);
    if (err?.data) console.error("detail:", JSON.stringify(err.data).slice(0, 400));
    if (err?.cause) console.error("cause :", String(err.cause).slice(0, 400));
    console.error(String(err?.stack ?? "").split("\n").slice(1, 6).join("\n"));
    process.exit(1);
  }

  if (created) {
    await payload.delete({ collection: "media", id: created.id, overrideAccess: true });
    console.log("\ncleaned up.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
