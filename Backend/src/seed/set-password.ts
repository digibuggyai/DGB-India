/* Sets a CMS account's password from the command line.
 *
 * This is the only way back in if a password is lost: no email adapter is
 * configured, so Payload's "forgot password" writes its mail to the server
 * console and never reaches anyone.
 *
 * Run it where the database credentials are — locally, against the same Neon
 * database the live site uses. It changes the account everywhere, at once.
 *
 *   npx tsx src/seed/set-password.ts someone@dgbindia.com 'a new password'
 */
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npx tsx src/seed/set-password.ts <email> '<new password>'");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Use at least 12 characters — this account can edit prices and read every enquiry.");
    process.exit(1);
  }

  const payload: any = await getPayload({ config });
  const found = await payload.find({
    collection: "users",
    where: { email: { equals: email.trim().toLowerCase() } },
    limit: 1,
    overrideAccess: true,
  });

  const user = found.docs[0];
  if (!user) {
    const all = await payload.find({ collection: "users", limit: 50, overrideAccess: true, depth: 0 });
    console.error(`No account for ${email}. The accounts on record are:`);
    for (const u of all.docs) console.error(`  ${u.email} (${u.role})`);
    process.exit(1);
  }

  await payload.update({ collection: "users", id: user.id, data: { password }, overrideAccess: true });
  console.log(`Password set for ${user.email} (${user.role}).`);
  console.log("It works on the live site and locally — both read the same database.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
