import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { s3Storage } from "@payloadcms/storage-s3";

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
import { NasModels } from "@/collections/NasModels";
import { NasDrives } from "@/collections/NasDrives";
import { NasUpgrades } from "@/collections/NasUpgrades";
import { NasPriceLogs } from "@/collections/NasPriceLogs";

import { SiteSettings } from "@/globals/SiteSettings";
import { Navigation } from "@/globals/Navigation";
import { CTABlocks } from "@/globals/CTABlocks";
import { NasSettings } from "@/globals/NasSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// Uploaded images live in the S3 bucket whenever its credentials are set — as
// they are on Railway, which wipes the server's own disk on every deploy, so
// anything stored there would vanish. Without them (on a laptop) uploads fall
// back to the local `media` folder. Files are served through Payload either
// way, so the bucket can stay private.
const s3 = {
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
};
const s3Enabled = Boolean(s3.bucket && s3.accessKeyId && s3.secretAccessKey);

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
    NasModels,
    NasDrives,
    NasUpgrades,
    NasPriceLogs,
  ],
  globals: [SiteSettings, Navigation, CTABlocks, NasSettings],
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
  plugins: [
    s3Storage({
      enabled: s3Enabled,
      collections: { media: true },
      bucket: s3.bucket ?? "",
      config: {
        credentials: { accessKeyId: s3.accessKeyId ?? "", secretAccessKey: s3.secretAccessKey ?? "" },
        region: s3.region,
        // S3-compatible providers (Railway, R2, MinIO) address buckets by path.
        ...(s3.endpoint ? { endpoint: s3.endpoint, forcePathStyle: true } : {}),
      },
    }),
  ],
  // Frontend is a separate app/origin now — it reads this API over HTTP
  // (REST for content, an API-key-authenticated POST for lead creation),
  // so both need to be allow-listed here.
  cors: [frontendUrl],
  csrf: [frontendUrl],
});
