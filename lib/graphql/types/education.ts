import { builder } from "../builder";

builder.prismaObject("Education", {
  fields: (t) => ({
    id: t.exposeID("id"),
    school: t.exposeString("school"),
    degree: t.exposeString("degree"),
    range: t.exposeString("range"),
    location: t.exposeString("location", { nullable: true }),
    description: t.exposeString("description", { nullable: true }),
    order: t.exposeInt("order"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
