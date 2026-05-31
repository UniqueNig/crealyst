import { builder } from "../builder";
import { prisma } from "../../prisma";

builder.queryField("healthcheck", (t) =>
  t.string({
    description: "Returns 'ok' if the GraphQL server is reachable.",
    resolve: () => "ok",
  })
);

builder.queryField("profile", (t) =>
  t.prismaField({
    type: "Profile",
    nullable: true,
    description: "Returns the single Profile row (the site owner).",
    resolve: (query) => prisma.profile.findFirst({ ...query }),
  })
);
