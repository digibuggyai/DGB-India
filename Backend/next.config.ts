import type { NextConfig } from "next";
import path from "path";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home dir (an ancestor of this
  // OneDrive path) made Next guess the wrong workspace root. Pin it.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
