import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import type { SessionPayload } from "../auth";

export type GraphQLContext = {
  session: SessionPayload | null;
};

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: GraphQLContext;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: () => prisma,
    dmmf: Prisma.dmmf,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  },
});

builder.scalarType("DateTime", {
  serialize: (date) => date.toISOString(),
  parseValue: (value) => {
    if (typeof value !== "string" && typeof value !== "number") {
      throw new Error("DateTime must be an ISO string or epoch number");
    }
    return new Date(value);
  },
});

builder.queryType({});
builder.mutationType({});

export function requireAdmin(ctx: GraphQLContext): SessionPayload {
  if (!ctx.session) throw new Error("UNAUTHORIZED");
  return ctx.session;
}
