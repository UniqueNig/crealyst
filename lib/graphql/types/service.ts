import { builder } from "../builder";

builder.prismaObject("Service", {
  fields: (t) => ({
    id: t.exposeID("id"),
    slug: t.exposeString("slug"),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    icon: t.exposeString("icon", { nullable: true }),
    features: t.exposeStringList("features"),
    order: t.exposeInt("order"),
    featured: t.exposeBoolean("featured"),
    published: t.exposeBoolean("published"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
