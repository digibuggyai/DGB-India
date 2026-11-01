import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { editorFeatures } from "@/lib/editorFeatures";
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
import { NasDriveLines } from "@/collections/NasDriveLines";
import { NasPriceLogs } from "@/collections/NasPriceLogs";
import { NasOfferCodes } from "@/collections/NasOfferCodes";

import { SiteSettings } from "@/globals/SiteSettings";
import { Navigation } from "@/globals/Navigation";
import { CTABlocks } from "@/globals/CTABlocks";
import { NasSettings } from "@/globals/NasSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

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
    NasDriveLines,
    NasPriceLogs,
    NasOfferCodes,
  ],
  globals: [SiteSettings, Navigation, CTABlocks, NasSettings],
  editor: lexicalEditor({ features: editorFeatures }),
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
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
        ...(s3.endpoint ? { endpoint: s3.endpoint, forcePathStyle: true } : {}),
      },
    }),
  ],
  cors: [frontendUrl],
  csrf: [frontendUrl],
});
