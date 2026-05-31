import { revalidateTag } from "next/cache";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

const ServiceInput = builder.inputType("ServiceInput", {
  fields: (t) => ({
    slug: t.string({ required: true }),
    title: t.string({ required: true }),
    description: t.string({ required: true }),
    icon: t.string({ required: false }),
    features: t.stringList({ required: true }),
    order: t.int({ required: false }),
    featured: t.boolean({ required: false }),
    published: t.boolean({ required: false }),
  }),
});

function invalidate(userId: string) {
  revalidateTag("services", { expire: 0 });
  revalidateTag(`services:user:${userId}`, { expire: 0 });
}

async function assertOwnsService(id: string, userId: string) {
  const exists = await prisma.service.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
}

builder.mutationField("createService", (t) =>
  t.prismaField({
    type: "Service",
    args: { input: t.arg({ type: ServiceInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const max = await prisma.service.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.service.create({
        ...query,
        data: {
          userId,
          slug: input.slug,
          title: input.title,
          description: input.description,
          icon: input.icon ?? null,
          features: input.features,
          order: input.order ?? (max._max.order ?? -1) + 1,
          featured: input.featured ?? true,
          published: input.published ?? true,
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("updateService", (t) =>
  t.prismaField({
    type: "Service",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: ServiceInput, required: true }),
    },
    resolve: async (query, _root, { id, input }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsService(id, session.sub);
      const result = await prisma.service.update({
        ...query,
        where: { id },
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description,
          icon: input.icon ?? null,
          features: input.features,
          ...(input.order != null ? { order: input.order } : {}),
          ...(input.featured != null ? { featured: input.featured } : {}),
          ...(input.published != null ? { published: input.published } : {}),
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("deleteService", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsService(id, session.sub);
      await prisma.service.delete({ where: { id } });
      invalidate(session.sub);
      return true;
    },
  })
);
