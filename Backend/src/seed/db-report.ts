/* What's in the database: server version, table sizes and exact row counts.
 *
 * Run it against the old database and the new one after a migration; the two
 * reports should agree line for line. Reads nothing but catalogue metadata and
 * counts, so it is safe against production.
 *
 *   npx tsx src/seed/db-report.ts                 → the database in .env
 *   npx tsx src/seed/db-report.ts "postgres://…"  → any other
 */
import "../../scripts/load-env.mts";
import pg from "pg";

async function main() {
  const uri = process.argv[2] ?? process.env.DATABASE_URI;
  if (!uri) {
    console.error("No connection string: pass one, or set DATABASE_URI.");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows: [meta] } = await client.query(
    "select version() as version, current_database() as db, pg_size_pretty(pg_database_size(current_database())) as size",
  );
  console.log(`\n${meta.db} — ${meta.size}`);
  console.log(String(meta.version).split(" on ")[0]);

  const { rows: tables } = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);

  let total = 0;
  const counts: [string, number][] = [];
  for (const { table_name } of tables) {
    // Counted rather than estimated: after a migration an estimate proves nothing.
    const { rows } = await client.query(`select count(*)::int as n from "${table_name}"`);
    counts.push([table_name, rows[0].n]);
    total += rows[0].n;
  }

  const width = Math.max(...counts.map(([t]) => t.length));
  console.log(`\n${tables.length} tables, ${total.toLocaleString("en-IN")} rows\n`);
  for (const [table, n] of counts) {
    if (n > 0) console.log(`  ${table.padEnd(width)}  ${String(n).padStart(6)}`);
  }
  const empty = counts.filter(([, n]) => n === 0).map(([t]) => t);
  if (empty.length) console.log(`\n  (${empty.length} empty tables)`);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
