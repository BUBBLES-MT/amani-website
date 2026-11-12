// frontend/app/sitemap.ts

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // ✅ Kwa sasa: Vercel URL
  // 🎯 Baadaye (baada ya domain): badilisha kuwa "https://amanichurch.com"
  const baseUrl = "https://amani-website-six.vercel.app";
  const now = new Date();

  return [
    // ✅ Kurasa kuu
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sermons`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },

    // ✅ Kurasa za huduma (baadaye utaongeza)
    {
      url: `${baseUrl}/ministries/vijana`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ministries/wanawake`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ministries/waimbaji`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ministries/wahudumu`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}