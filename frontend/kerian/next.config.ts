import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  images: {
    domains: [
      "localhost",
      "alghulperformanceshop.com",
      "static.musictoday.com",
      "i00.eu",
      "f4.bcbits.com",
      "ih1.redbubble.net",
      "encrypted-tbn0.gstatic.com",
      "www.ikks.com",
      "costacasual.com",
      "m.media-amazon.com",
      "i.etsystatic.com"
    ],
  },
  async redirects() {
    return [
      {
        source: "/my-orders",
        destination: "/profile?tab=orders",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
