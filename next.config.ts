import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/**
 * The hero image comes from the public `page-images` bucket of the Supabase
 * project. `SUPABASE_URL` is server-only, so the allowed host is derived here
 * at build time; with the variable unset no remote image is allowed.
 */
function pageImagePatterns(): RemotePattern[] {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return [];

  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    return [
      {
        protocol: protocol === "http:" ? "http" : "https",
        hostname,
        port,
        pathname: "/storage/v1/object/public/page-images/**",
        search: "",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: pageImagePatterns(),
  },
};

export default nextConfig;
