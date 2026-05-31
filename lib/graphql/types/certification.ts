import { builder } from "../builder";

builder.prismaObject("Certification", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    issuer: t.exposeString("issuer"),
    year: t.exposeString("year"),
    credentialUrl: t.exposeString("credentialUrl", { nullable: true }),
    order: t.exposeInt("order"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
