import "../../scripts/load-env.mts";
import fs from "fs";
import pg from "pg";

export type Snapshot = {
  takenAt: string;
  database: string;
  server: string;
  tables: Record<string, Record<string, unknown>[]>;
};

async function main() {
  const target = process.argv[2] ?? `snapshot-${new Date().toISOString().slice(0, 10)}.json`;
  const uri = process.argv[3] ?? process.env.DATABASE_URI;
  if (!uri) {
    console.error("No connection string: pass one, or set DATABASE_URI.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows: [meta] } = await client.query("select current_database() as db, version() as version");
  const { rows: tables } = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);

  const snapshot: Snapshot = {
    takenAt: new Date().toISOString(),
    database: meta.db,
    server: String(meta.version).split(" on ")[0],
    tables: {},
  };

  let total = 0;
  for (const { table_name } of tables) {
    const { rows } = await client.query(`select * from "${table_name}"`);
    snapshot.tables[table_name] = rows;
    total += rows.length;
  }

  fs.writeFileSync(target, JSON.stringify(snapshot, null, 1));
  const size = (fs.statSync(target).size / 1024).toFixed(0);

  console.log(`Wrote ${total} rows from ${tables.length} tables to ${target} (${size} KB).`);
  console.log("It holds password hashes and every enquiry — keep it private.");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
