/**
 * Cloudinary serves uploaded files with Content-Disposition: inline by default,
 * which makes browsers open PDFs in a new tab instead of downloading them.
 *
 * The `download` attribute on <a> is silently ignored for cross-origin URLs
 * (like res.cloudinary.com), so we have to ask Cloudinary itself to force a
 * download. The `fl_attachment[:filename]` URL flag sets
 * Content-Disposition: attachment on the response.
 *
 * If the URL isn't a Cloudinary URL, returns it unchanged.
 */
export function forceDownloadUrl(url: string, filename = "download"): string {
  if (!url) return url;
  const match = url.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|raw|video|auto)\/upload)\/(.+)$/
  );
  if (!match) return url;
  const [, base, rest] = match;
  if (rest.includes("fl_attachment")) return url;
  const safeName = filename.replace(/[^\w.-]/g, "_");
  return `${base}/fl_attachment:${safeName}/${rest}`;
}
