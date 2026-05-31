emmanuelfaniyi/
├── prisma/
│   ├── schema.prisma          ← 7 models (AdminUser, Profile, Skill, Service, Project, Experience, ContactMessage)
│   └── seed.ts                ← seeds admin user + initial Profile row
├── lib/
│   ├── prisma.ts              ← singleton Prisma client
│   ├── auth.ts                ← bcrypt + JWT cookies + getSession/verifySession
│   ├── cloudinary.ts          ← server helper, signed uploads
│   ├── cn.ts                  ← clsx + tailwind-merge
│   ├── urql/client.ts         ← GraphQL client for admin (client side)
│   └── graphql/
│       ├── builder.ts         ← Pothos schema builder + Prisma plugin
│       ├── schema.ts          ← schema entrypoint
│       ├── types/profile.ts   ← first object type
│       └── queries/meta.ts    ← `healthcheck` + `profile` queries
├── components/
│   ├── providers/
│   │   ├── theme-provider.tsx ← next-themes wrapper
│   │   └── urql-provider.tsx  ← urql wrapper (for admin layout)
│   ├── layout/
│   │   ├── navbar.tsx         ← responsive sticky nav with theme toggle
│   │   ├── footer.tsx         ← social links + nav
│   │   └── theme-toggle.tsx   ← sun/moon switch
│   └── icons/brand.tsx        ← inline GitHub/LinkedIn/Twitter SVGs
├── app/
│   ├── layout.tsx             ← ThemeProvider, fonts, metadata
│   ├── globals.css            ← Tailwind 4 + design tokens (cobalt brand scale + dark/light vars + skeleton)
│   ├── sitemap.ts             ← reads from DB later
│   ├── robots.ts              ← disallows /admin, /api
│   ├── opengraph-image.tsx    ← 1200×630 OG, edge runtime
│   ├── api/graphql/route.ts   ← Yoga handler (GET/POST/OPTIONS)
│   └── (site)/
│       ├── layout.tsx         ← public layout (navbar + footer)
│       ├── page.tsx           ← Phase 1 hero placeholder
│       ├── about/page.tsx
│       ├── services/page.tsx
│       ├── projects/page.tsx
│       └── contact/page.tsx
├── proxy.ts                   ← gates /admin routes (Next 16's renamed middleware)
├── next.config.ts             ← Cloudinary image domain whitelisted
├── .env / .env.example        ← all variables documented
└── package.json               ← new scripts: db:push, db:seed, db:studio
