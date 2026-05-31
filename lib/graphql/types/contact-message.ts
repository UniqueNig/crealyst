import { builder } from "../builder";

builder.prismaObject("ContactMessage", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    phone: t.exposeString("phone", { nullable: true }),
    subject: t.exposeString("subject", { nullable: true }),
    message: t.exposeString("message"),
    read: t.exposeBoolean("read"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
