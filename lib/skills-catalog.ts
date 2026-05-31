/**
 * Catalog of well-known tools, platforms, and skills that users can pick from
 * in the admin instead of typing a name + uploading a logo for each one.
 * Covers many disciplines — developers, designers, marketers, data analysts,
 * researchers, product folks, etc.
 *
 * Icons come from Simple Icons CDN — `https://cdn.simpleicons.org/<slug>` —
 * which serves the SVG in the brand's color by default. No bundling required.
 *
 * To add a new entry:
 *  - `key`: stable id used as a catalog lookup key (kebab-case, never changes)
 *  - `name`: human-readable display name (this is what gets stored on Skill.name)
 *  - `category`: bucket the public site groups the skill under
 *  - `slug`: the simple-icons slug. Find it at https://simpleicons.org/
 *
 * If simple-icons doesn't have the brand, fall back to letting the user add
 * it as a custom skill (the "Add custom" section of the picker still works).
 */

import type { SkillCategory } from "@prisma/client";

export type CatalogSkill = {
  key: string;
  name: string;
  category: SkillCategory;
  iconUrl: string;
};

/**
 * Brand-colored SVG endpoint. Works for brands that opted in to Simple Icons'
 * branded CDN. Many big brands (Microsoft, Adobe, LinkedIn, Slack, AWS, etc.)
 * have opted out, so we fall back to MONO_ICON for those — their SVGs still
 * live on the jsdelivr npm mirror but render monochrome.
 */
const COLOR_ICON = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const MONO_ICON = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

// Helper for known-colored brands (slug exists at cdn.simpleicons.org).
const make = (
  key: string,
  name: string,
  category: SkillCategory,
  slug: string
): CatalogSkill => ({ key, name, category, iconUrl: COLOR_ICON(slug) });

// Helper for brands that exist in simple-icons npm package but are NOT served
// by cdn.simpleicons.org (opt-out / trademark restrictions). Renders the SVG
// from jsdelivr — it's monochrome, so the public renderer applies
// `dark:invert` so the logo is visible on dark backgrounds.
const mono = (
  key: string,
  name: string,
  category: SkillCategory,
  slug: string
): CatalogSkill => ({ key, name, category, iconUrl: MONO_ICON(slug) });

/**
 * Returns true if an icon URL is the monochrome jsdelivr variant — the
 * renderer uses this to apply `dark:invert` so the SVG stays visible.
 */
export function isMonochromeIcon(iconUrl: string | null | undefined): boolean {
  return !!iconUrl && iconUrl.startsWith("https://cdn.jsdelivr.net/npm/simple-icons");
}

export const SKILLS_CATALOG: CatalogSkill[] = [
  // ─── Languages ────────────────────────────────────────────────────────
  make("html5", "HTML5", "LANGUAGE", "html5"),
  make("css3", "CSS3", "LANGUAGE", "css"),
  make("javascript", "JavaScript", "LANGUAGE", "javascript"),
  make("typescript", "TypeScript", "LANGUAGE", "typescript"),
  make("python", "Python", "LANGUAGE", "python"),
  make("java", "Java", "LANGUAGE", "openjdk"),
  make("go", "Go", "LANGUAGE", "go"),
  make("rust", "Rust", "LANGUAGE", "rust"),
  make("ruby", "Ruby", "LANGUAGE", "ruby"),
  make("php", "PHP", "LANGUAGE", "php"),
  make("swift", "Swift", "LANGUAGE", "swift"),
  make("kotlin", "Kotlin", "LANGUAGE", "kotlin"),
  make("dart", "Dart", "LANGUAGE", "dart"),
  make("c", "C", "LANGUAGE", "c"),
  make("cpp", "C++", "LANGUAGE", "cplusplus"),
  mono("csharp", "C#", "LANGUAGE", "csharp"),
  make("scala", "Scala", "LANGUAGE", "scala"),
  make("r", "R", "LANGUAGE", "r"),
  make("solidity", "Solidity", "LANGUAGE", "solidity"),
  make("bash", "Bash", "LANGUAGE", "gnubash"),

  // ─── Frameworks & Libraries ───────────────────────────────────────────
  make("react", "React", "FRAMEWORK", "react"),
  make("nextjs", "Next.js", "FRAMEWORK", "nextdotjs"),
  make("vue", "Vue", "FRAMEWORK", "vuedotjs"),
  make("nuxt", "Nuxt", "FRAMEWORK", "nuxt"),
  make("angular", "Angular", "FRAMEWORK", "angular"),
  make("svelte", "Svelte", "FRAMEWORK", "svelte"),
  make("astro", "Astro", "FRAMEWORK", "astro"),
  make("remix", "Remix", "FRAMEWORK", "remix"),
  make("gatsby", "Gatsby", "FRAMEWORK", "gatsby"),
  make("nodejs", "Node.js", "FRAMEWORK", "nodedotjs"),
  make("express", "Express", "FRAMEWORK", "express"),
  make("nestjs", "NestJS", "FRAMEWORK", "nestjs"),
  make("django", "Django", "FRAMEWORK", "django"),
  make("flask", "Flask", "FRAMEWORK", "flask"),
  make("fastapi", "FastAPI", "FRAMEWORK", "fastapi"),
  make("spring", "Spring", "FRAMEWORK", "spring"),
  make("laravel", "Laravel", "FRAMEWORK", "laravel"),
  make("rails", "Ruby on Rails", "FRAMEWORK", "rubyonrails"),
  make("dotnet", ".NET", "FRAMEWORK", "dotnet"),
  make("flutter", "Flutter", "FRAMEWORK", "flutter"),
  make("reactnative", "React Native", "FRAMEWORK", "react"),
  make("tailwind", "Tailwind CSS", "FRAMEWORK", "tailwindcss"),
  make("bootstrap", "Bootstrap", "FRAMEWORK", "bootstrap"),
  make("graphql", "GraphQL", "FRAMEWORK", "graphql"),
  make("jest", "Jest", "FRAMEWORK", "jest"),
  mono("playwright", "Playwright", "FRAMEWORK", "playwright"),
  make("cypress", "Cypress", "FRAMEWORK", "cypress"),

  // ─── Databases ────────────────────────────────────────────────────────
  make("postgresql", "PostgreSQL", "DATABASE", "postgresql"),
  make("mysql", "MySQL", "DATABASE", "mysql"),
  make("mongodb", "MongoDB", "DATABASE", "mongodb"),
  make("sqlite", "SQLite", "DATABASE", "sqlite"),
  make("redis", "Redis", "DATABASE", "redis"),
  make("firebase", "Firebase", "DATABASE", "firebase"),
  make("supabase", "Supabase", "DATABASE", "supabase"),
  make("prisma", "Prisma", "DATABASE", "prisma"),
  mono("dynamodb", "DynamoDB", "DATABASE", "amazondynamodb"),
  make("elasticsearch", "Elasticsearch", "DATABASE", "elasticsearch"),

  // ─── Developer tools / infra ──────────────────────────────────────────
  make("git", "Git", "TOOL", "git"),
  make("github", "GitHub", "TOOL", "github"),
  make("gitlab", "GitLab", "TOOL", "gitlab"),
  make("bitbucket", "Bitbucket", "TOOL", "bitbucket"),
  mono("vscode", "VS Code", "TOOL", "visualstudiocode"),
  make("vim", "Vim", "TOOL", "vim"),
  make("docker", "Docker", "TOOL", "docker"),
  make("kubernetes", "Kubernetes", "TOOL", "kubernetes"),
  mono("aws", "AWS", "TOOL", "amazonwebservices"),
  make("gcp", "Google Cloud", "TOOL", "googlecloud"),
  mono("azure", "Microsoft Azure", "TOOL", "microsoftazure"),
  make("vercel", "Vercel", "TOOL", "vercel"),
  make("netlify", "Netlify", "TOOL", "netlify"),
  make("cloudflare", "Cloudflare", "TOOL", "cloudflare"),
  make("linux", "Linux", "TOOL", "linux"),
  make("ubuntu", "Ubuntu", "TOOL", "ubuntu"),
  make("npm", "npm", "TOOL", "npm"),
  make("pnpm", "pnpm", "TOOL", "pnpm"),
  make("yarn", "Yarn", "TOOL", "yarn"),
  make("vite", "Vite", "TOOL", "vite"),
  make("webpack", "Webpack", "TOOL", "webpack"),
  make("postman", "Postman", "TOOL", "postman"),
  make("insomnia", "Insomnia", "TOOL", "insomnia"),
  make("wordpress", "WordPress", "TOOL", "wordpress"),
  make("shopify", "Shopify", "TOOL", "shopify"),
  make("woocommerce", "WooCommerce", "TOOL", "woocommerce"),
  make("stripe", "Stripe", "TOOL", "stripe"),
  make("paypal", "PayPal", "TOOL", "paypal"),

  // ─── Design ───────────────────────────────────────────────────────────
  make("figma", "Figma", "DESIGN", "figma"),
  make("sketch", "Sketch", "DESIGN", "sketch"),
  mono("adobexd", "Adobe XD", "DESIGN", "adobexd"),
  mono("photoshop", "Adobe Photoshop", "DESIGN", "adobephotoshop"),
  mono("illustrator", "Adobe Illustrator", "DESIGN", "adobeillustrator"),
  mono("indesign", "Adobe InDesign", "DESIGN", "adobeindesign"),
  mono("premiere", "Adobe Premiere Pro", "DESIGN", "adobepremierepro"),
  mono("aftereffects", "Adobe After Effects", "DESIGN", "adobeaftereffects"),
  mono("lightroom", "Adobe Lightroom", "DESIGN", "adobelightroom"),
  mono("canva", "Canva", "DESIGN", "canva"),
  make("framer", "Framer", "DESIGN", "framer"),
  mono("invision", "InVision", "DESIGN", "invision"),
  make("webflow", "Webflow", "DESIGN", "webflow"),
  make("blender", "Blender", "DESIGN", "blender"),
  mono("affinity", "Affinity Designer", "DESIGN", "affinitydesigner"),
  // Vector / raster / illustration
  make("coreldraw", "CorelDRAW", "DESIGN", "coreldraw"),
  make("gimp", "GIMP", "DESIGN", "gimp"),
  make("inkscape", "Inkscape", "DESIGN", "inkscape"),
  make("krita", "Krita", "DESIGN", "krita"),
  mono("affinityphoto", "Affinity Photo", "DESIGN", "affinityphoto"),
  mono("affinitypublisher", "Affinity Publisher", "DESIGN", "affinitypublisher"),
  mono("acrobat", "Adobe Acrobat", "DESIGN", "adobeacrobatreader"),
  mono("creativecloud", "Adobe Creative Cloud", "DESIGN", "adobecreativecloud"),
  // 3D & motion
  make("cinema4d", "Cinema 4D", "DESIGN", "cinema4d"),
  make("maya", "Autodesk Maya", "DESIGN", "autodeskmaya"),
  make("sketchup", "SketchUp", "DESIGN", "sketchup"),
  make("davinci", "DaVinci Resolve", "DESIGN", "davinciresolve"),
  make("rive", "Rive", "DESIGN", "rive"),
  make("lottie", "LottieFiles", "DESIGN", "lottiefiles"),
  // Typography, stock & icon libraries
  make("googlefonts", "Google Fonts", "DESIGN", "googlefonts"),
  mono("adobefonts", "Adobe Fonts", "DESIGN", "adobefonts"),
  make("fontawesome", "Font Awesome", "DESIGN", "fontawesome"),
  make("unsplash", "Unsplash", "DESIGN", "unsplash"),
  make("pexels", "Pexels", "DESIGN", "pexels"),
  make("freepik", "Freepik", "DESIGN", "freepik"),
  mono("shutterstock", "Shutterstock", "DESIGN", "shutterstock"),
  make("iconfinder", "Iconfinder", "DESIGN", "iconfinder"),
  // Hardware, whiteboarding & showcase platforms
  make("wacom", "Wacom", "DESIGN", "wacom"),
  make("miro", "Miro", "DESIGN", "miro"),
  make("dribbble", "Dribbble", "DESIGN", "dribbble"),
  make("behance", "Behance", "DESIGN", "behance"),

  // ─── Marketing ────────────────────────────────────────────────────────
  make("googleads", "Google Ads", "MARKETING", "googleads"),
  make("metaads", "Meta Ads", "MARKETING", "meta"),
  make("hubspot", "HubSpot", "MARKETING", "hubspot"),
  make("mailchimp", "Mailchimp", "MARKETING", "mailchimp"),
  mono("salesforce", "Salesforce", "MARKETING", "salesforce"),
  make("buffer", "Buffer", "MARKETING", "buffer"),
  make("hootsuite", "Hootsuite", "MARKETING", "hootsuite"),
  make("zapier", "Zapier", "MARKETING", "zapier"),
  make("semrush", "Semrush", "MARKETING", "semrush"),
  make("substack", "Substack", "MARKETING", "substack"),
  make("medium", "Medium", "MARKETING", "medium"),
  mono("linkedin", "LinkedIn", "MARKETING", "linkedin"),
  make("youtube", "YouTube", "MARKETING", "youtube"),
  make("tiktok", "TikTok", "MARKETING", "tiktok"),
  make("instagram", "Instagram", "MARKETING", "instagram"),
  make("twitter", "X (Twitter)", "MARKETING", "x"),

  // ─── Analytics & data ─────────────────────────────────────────────────
  make("googleanalytics", "Google Analytics", "ANALYTICS", "googleanalytics"),
  mono("tableau", "Tableau", "ANALYTICS", "tableau"),
  mono("powerbi", "Power BI", "ANALYTICS", "powerbi"),
  make("looker", "Looker", "ANALYTICS", "looker"),
  make("mixpanel", "Mixpanel", "ANALYTICS", "mixpanel"),
  make("hotjar", "Hotjar", "ANALYTICS", "hotjar"),
  mono("excel", "Microsoft Excel", "ANALYTICS", "microsoftexcel"),
  make("googlesheets", "Google Sheets", "ANALYTICS", "googlesheets"),
  make("jupyter", "Jupyter", "ANALYTICS", "jupyter"),
  make("pandas", "pandas", "ANALYTICS", "pandas"),
  make("numpy", "NumPy", "ANALYTICS", "numpy"),
  make("tensorflow", "TensorFlow", "ANALYTICS", "tensorflow"),
  make("pytorch", "PyTorch", "ANALYTICS", "pytorch"),
  mono("openai", "OpenAI", "ANALYTICS", "openai"),

  // ─── Productivity & collaboration ─────────────────────────────────────
  mono("notion", "Notion", "PRODUCTIVITY", "notion"),
  mono("slack", "Slack", "PRODUCTIVITY", "slack"),
  make("trello", "Trello", "PRODUCTIVITY", "trello"),
  make("asana", "Asana", "PRODUCTIVITY", "asana"),
  make("linear", "Linear", "PRODUCTIVITY", "linear"),
  make("jira", "Jira", "PRODUCTIVITY", "jira"),
  make("confluence", "Confluence", "PRODUCTIVITY", "confluence"),
  make("clickup", "ClickUp", "PRODUCTIVITY", "clickup"),
  make("zoom", "Zoom", "PRODUCTIVITY", "zoom"),
  mono("teams", "Microsoft Teams", "PRODUCTIVITY", "microsoftteams"),
  make("discord", "Discord", "PRODUCTIVITY", "discord"),
  make("airtable", "Airtable", "PRODUCTIVITY", "airtable"),
  make("googledrive", "Google Drive", "PRODUCTIVITY", "googledrive"),
  make("googlemeet", "Google Meet", "PRODUCTIVITY", "googlemeet"),
  mono("word", "Microsoft Word", "PRODUCTIVITY", "microsoftword"),
  mono("powerpoint", "PowerPoint", "PRODUCTIVITY", "microsoftpowerpoint"),
  mono("outlook", "Outlook", "PRODUCTIVITY", "microsoftoutlook"),
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  LANGUAGE: "Languages",
  FRAMEWORK: "Frameworks & libraries",
  DATABASE: "Databases",
  TOOL: "Tools & platforms",
  DESIGN: "Design",
  MARKETING: "Marketing",
  ANALYTICS: "Analytics & data",
  PRODUCTIVITY: "Productivity",
  OTHER: "Other",
};

// The order categories appear in the picker. This is a graphic designer's
// deployment, so design-led buckets come first; dev-heavy buckets sink down.
export const CATEGORY_ORDER: SkillCategory[] = [
  "DESIGN",
  "TOOL",
  "MARKETING",
  "PRODUCTIVITY",
  "LANGUAGE",
  "FRAMEWORK",
  "DATABASE",
  "ANALYTICS",
  "OTHER",
];

export function getCatalogSkill(key: string): CatalogSkill | undefined {
  return SKILLS_CATALOG.find((s) => s.key === key);
}
