import { builder } from "../builder";

builder.prismaObject("Profile", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    title: t.exposeString("title"),
    tagline: t.exposeString("tagline"),
    bio: t.exposeString("bio"),
    email: t.exposeString("email"),
    location: t.exposeString("location", { nullable: true }),
    avatarUrl: t.exposeString("avatarUrl", { nullable: true }),
    resumeUrl: t.exposeString("resumeUrl", { nullable: true }),
    github: t.exposeString("github", { nullable: true }),
    linkedin: t.exposeString("linkedin", { nullable: true }),
    twitter: t.exposeString("twitter", { nullable: true }),
    instagram: t.exposeString("instagram", { nullable: true }),
    dribbble: t.exposeString("dribbble", { nullable: true }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
