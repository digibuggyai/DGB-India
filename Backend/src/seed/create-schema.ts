/* Builds Payload's tables in an empty database.
 *
 * Payload keeps the schema in step with the config on boot (`push: true`), so
 * starting it once against a new database is all it takes — no migration files,
 * no dump to restore, and no dependency on the version the old provider ran.
 * This boots it without the web server, reports what it made, and exits.
 *
 *   DATABASE_URI="postgres://…new…" npx tsx src/seed/create-schema.ts
 */
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import pg from "pg";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

async function main() {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    console.error("DATABASE_URI isn't set — that's the database to build.");
    process.exit(1);
  }
  console.log(`Building the schema in ${new URL(uri).host}…\n`);

  // Booting Payload is what creates the tables.
  await getPayload({ config });

  const client = new pg.Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const { rows } = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);
  await client.end();

  console.log(`\n${rows.length} tables now exist.`);
  console.log(rows.length ? "Copy the data in with copy-database.ts." : "Nothing was created — check the connection string.");
  process.exit(rows.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
