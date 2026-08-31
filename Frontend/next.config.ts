import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const apiHost = new URL(apiUrl);

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home dir (an ancestor of this
  // OneDrive path) made Next guess the wrong workspace root. Pin it.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      // The Payload backend serves uploaded media from its own origin.
      { protocol: apiHost.protocol.replace(":", "") as "http" | "https", hostname: apiHost.hostname, port: apiHost.port },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
