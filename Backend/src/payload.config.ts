import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { Industries } from "@/collections/Industries";
import { Infrastructure } from "@/collections/Infrastructure";
import { Workloads } from "@/collections/Workloads";
import { Applications } from "@/collections/Applications";
import { CaseStudies } from "@/collections/CaseStudies";
import { Posts } from "@/collections/Posts";
import { Authors } from "@/collections/Authors";
import { FAQs } from "@/collections/FAQs";
import { Testimonials } from "@/collections/Testimonials";
import { Partners } from "@/collections/Partners";
import { Leads } from "@/collections/Leads";

import { SiteSettings } from "@/globals/SiteSettings";
import { Navigation } from "@/globals/Navigation";
import { CTABlocks } from "@/globals/CTABlocks";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

export default buildConfig({
  serverURL: process.env.PAYLOAD_URL || "http://localhost:4000",
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " — DGB India Enterprise CMS",
    },
  },
  collections: [
    Users,
    Media,
    Industries,
    Infrastructure,
    Workloads,
    Applications,
    CaseStudies,
    Posts,
    Authors,
    FAQs,
    Testimonials,
    Partners,
    Leads,
  ],
  globals: [SiteSettings, Navigation, CTABlocks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    // No migration files exist yet — auto-sync the schema on boot instead.
    // Fine while there's no real production data; switch to proper
    // migrations (payload migrate:create / migrate) once the schema
    // stabilizes and this DB holds real leads/content.
    push: true,
  }),
  sharp,
  // Frontend is a separate app/origin now — it reads this API over HTTP
  // (REST for content, an API-key-authenticated POST for lead creation),
  // so both need to be allow-listed here.
  cors: [frontendUrl],
  csrf: [frontendUrl],
});
