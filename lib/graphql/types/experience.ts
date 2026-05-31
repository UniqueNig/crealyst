import { builder } from "../builder";

builder.prismaObject("Experience", {
  fields: (t) => ({
    id: t.exposeID("id"),
    company: t.exposeString("company"),
    role: t.exposeString("role"),
    location: t.exposeString("location", { nullable: true }),
    startDate: t.expose("startDate", { type: "DateTime" }),
    endDate: t.expose("endDate", { type: "DateTime", nullable: true }),
    description: t.exposeString("description", { nullable: true }),
    bullets: t.exposeStringList("bullets"),
    companyUrl: t.exposeString("companyUrl", { nullable: true }),
    order: t.exposeInt("order"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});
