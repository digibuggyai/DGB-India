import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

async function main() {
  const tag = process.argv[2];
  if (!tag) {
    console.error("Pass the tag to delete, e.g. codecheck-1758... or an exact email.");
    process.exit(1);
  }

  const payload: any = await getPayload({ config });
  let removed = 0;

  for (const collection of ["nas-offer-codes", "leads"]) {
    const found = await payload.find({
      collection,
      where: { email: { like: tag } },
      limit: 200,
      overrideAccess: true,
      depth: 0,
    });
    for (const doc of found.docs) {
      await payload.delete({ collection, id: doc.id, overrideAccess: true });
      console.log(`  - ${collection}: ${doc.email}${doc.code ? ` (${doc.code})` : ""}`);
      removed++;
    }
  }

  console.log(`\nDeleted ${removed} record${removed === 1 ? "" : "s"} matching "${tag}".`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
