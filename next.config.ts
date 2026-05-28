import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Matches /@username and captures the username part
        source: "/@:username",
        destination: "/user/:username",
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true, // 🍉 Allow Next.js to render SVG graphics
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
