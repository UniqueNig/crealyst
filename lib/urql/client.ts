"use client";

import {
  Client,
  cacheExchange,
  fetchExchange,
  ssrExchange,
  createClient,
} from "urql";

let browserClient: Client | null = null;

function siteUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getUrqlClient(): Client {
  if (browserClient) return browserClient;
  const isServer = typeof window === "undefined";
  const ssr = ssrExchange({ isClient: !isServer });
  const client = createClient({
    url: `${siteUrl()}/api/graphql`,
    exchanges: [cacheExchange, ssr, fetchExchange],
    fetchOptions: {
      credentials: "include",
    },
  });
  if (!isServer) browserClient = client;
  return client;
}
