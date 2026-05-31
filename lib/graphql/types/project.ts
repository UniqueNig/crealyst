import { builder } from "../builder";

builder.prismaObject("Project", {
  fields: (t) => ({
    id: t.exposeID("id"),
    slug: t.exposeString("slug"),
    title: t.exposeString("title"),
    summary: t.exposeString("summary"),
    description: t.exposeString("description"),
    role: t.exposeString("role"),
    year: t.exposeInt("year"),
    liveUrl: t.exposeString("liveUrl", { nullable: true }),
    repoUrl: t.exposeString("repoUrl", { nullable: true }),
    coverImage: t.exposeString("coverImage"),
    gallery: t.exposeStringList("gallery"),
    techStack: t.exposeStringList("techStack"),
    tags: t.exposeStringList("tags"),
    order: t.exposeInt("order"),
    featured: t.exposeBoolean("featured"),
    published: t.exposeBoolean("published"),
    metaTitle: t.exposeString("metaTitle", { nullable: true }),
    metaDesc: t.exposeString("metaDesc", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
