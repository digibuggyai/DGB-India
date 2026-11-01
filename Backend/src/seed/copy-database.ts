import "../../scripts/load-env.mts";
import fs from "fs";
import pg from "pg";
import type { Snapshot } from "./export-snapshot";

type Table = { name: string; rows: number };

const connect = async (connectionString: string) => {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
};

const tablesIn = async (client: pg.Client): Promise<string[]> => {
  const { rows } = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);
  return rows.map((r) => r.table_name);
};

const countRows = async (client: pg.Client, table: string): Promise<number> => {
  const { rows } = await client.query(`select count(*)::int as n from "${table}"`);
  return rows[0].n;
};

const jsonColumnsIn = async (client: pg.Client, table: string): Promise<Set<string>> => {
  const { rows } = await client.query(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = $1 and data_type in ('json', 'jsonb')`,
    [table],
  );
  return new Set(rows.map((r) => r.column_name));
};

async function main() {
  const target = process.argv[2];
  const force = process.argv.includes("--force");
  const fileAt = process.argv.indexOf("--from");
  const snapshotPath = fileAt === -1 ? null : process.argv[fileAt + 1];

  if (!target || target.startsWith("--")) {
    console.error('Usage: npx tsx src/seed/copy-database.ts "postgres://…target…" [--force] [--from snapshot.json]');
    process.exit(1);
  }

  const snapshot: Snapshot | null = snapshotPath ? (JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as Snapshot) : null;
  const source = snapshot ? null : process.env.DATABASE_URI;

  if (!snapshot && !source) {
    console.error("DATABASE_URI isn't set, and no --from snapshot was given.");
    process.exit(1);
  }
  if (source && new URL(target).host === new URL(source).host) {
    console.error("The target is the same host as the source. Refusing.");
    process.exit(1);
  }
  if (snapshot) console.log(`Restoring ${snapshot.database} as it was on ${snapshot.takenAt}.\n`);

  const from = source ? await connect(source) : null;
  const to = await connect(target);

  const sourceTables = from ? await tablesIn(from) : Object.keys(snapshot!.tables).sort();
  const rowsOf = async (table: string) => (from ? (await from.query(`select * from "${table}"`)).rows : (snapshot!.tables[table] ?? []));
  const targetTables = new Set(await tablesIn(to));

  const missing = sourceTables.filter((t) => !targetTables.has(t));
  if (missing.length) {
    console.error(`The target is missing ${missing.length} tables, so Payload hasn't built its schema there yet.`);
    console.error(`Start the backend once against the new database, let it finish, then run this again.`);
    console.error(`Missing: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`);
    process.exit(1);
  }

  const occupied: string[] = [];
  for (const table of sourceTables) {
    if ((await countRows(to, table)) > 0) occupied.push(table);
  }
  if (occupied.length && !force) {
    console.error(`The target already holds rows in: ${occupied.join(", ")}.`);
    console.error("Re-run with --force to empty those tables first.");
    process.exit(1);
  }

  let deferred = true;
  try {
    await to.query("set session_replication_role = replica");
  } catch {
    deferred = false;
    console.log("Note: couldn't defer foreign keys — copying in dependency order instead.\n");
  }

  if (occupied.length) {
    for (const table of [...sourceTables].reverse()) await to.query(`delete from "${table}"`);
    console.log(`Emptied ${occupied.length} tables on the target.\n`);
  }

  const copied: Table[] = [];
  const BATCH = 500;

  for (const table of sourceTables) {
    const rows = await rowsOf(table);
    if (!rows.length) continue;

    const columns = Object.keys(rows[0]);
    const quoted = columns.map((c) => `"${c}"`).join(", ");
    const jsonColumns = await jsonColumnsIn(to, table);
    const encode = (column: string, value: unknown) =>
      jsonColumns.has(column) && value !== null && typeof value === "object" ? JSON.stringify(value) : value;

    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const values: unknown[] = [];
      const tuples = slice.map((row) => {
        const placeholders = columns.map((c) => {
          values.push(encode(c, row[c]));
          return `$${values.length}`;
        });
        return `(${placeholders.join(", ")})`;
      });
      await to.query(`insert into "${table}" (${quoted}) values ${tuples.join(", ")}`, values);
    }

    copied.push({ name: table, rows: rows.length });
    console.log(`  ${table.padEnd(34)} ${String(rows.length).padStart(5)}`);
  }

  let sequences = 0;
  for (const table of sourceTables) {
    const { rows: cols } = await to.query(
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name = $1
         and (is_identity = 'YES' or column_default like 'nextval%')`,
      [table],
    );
    for (const { column_name } of cols) {
      const { rows } = await to.query(
        `select setval(pg_get_serial_sequence($1, $2), coalesce((select max("${column_name}") from "${table}"), 1), true) as v`,
        [table, column_name],
      );
      if (rows[0]?.v != null) sequences++;
    }
  }

  if (deferred) await to.query("set session_replication_role = default");

  let mismatches = 0;
  for (const table of sourceTables) {
    const before = from ? await countRows(from, table) : (snapshot!.tables[table] ?? []).length;
    const after = await countRows(to, table);
    if (before !== after) {
      console.error(`  MISMATCH ${table}: source ${before}, target ${after}`);
      mismatches++;
    }
  }

  const total = copied.reduce((n, t) => n + t.rows, 0);
  console.log(`\nCopied ${total} rows across ${copied.length} tables; reset ${sequences} sequences.`);
  console.log(mismatches ? `${mismatches} tables do NOT match — do not switch over.` : "Every table matches the source.");

  await from?.end();
  await to.end();
  process.exit(mismatches ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
