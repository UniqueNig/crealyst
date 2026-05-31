import { revalidateTag } from "next/cache";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

const ExperienceInput = builder.inputType("ExperienceInput", {
  fields: (t) => ({
    company: t.string({ required: true }),
    role: t.string({ required: true }),
    location: t.string({ required: false }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime", required: false }),
    description: t.string({ required: false }),
    bullets: t.stringList({ required: true }),
    companyUrl: t.string({ required: false }),
    order: t.int({ required: false }),
  }),
});

function invalidate(userId: string) {
  revalidateTag("experience", { expire: 0 });
  revalidateTag(`experience:user:${userId}`, { expire: 0 });
}

async function assertOwnsExperience(id: string, userId: string) {
  const exists = await prisma.experience.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
}

builder.mutationField("createExperience", (t) =>
  t.prismaField({
    type: "Experience",
    args: { input: t.arg({ type: ExperienceInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const max = await prisma.experience.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.experience.create({
        ...query,
        data: {
          userId,
          company: input.company,
          role: input.role,
          location: input.location ?? null,
          startDate: input.startDate,
          endDate: input.endDate ?? null,
          description: input.description ?? null,
          bullets: input.bullets,
          companyUrl: input.companyUrl ?? null,
          order: input.order ?? (max._max.order ?? -1) + 1,
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("updateExperience", (t) =>
  t.prismaField({
    type: "Experience",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: ExperienceInput, required: true }),
    },
    resolve: async (query, _root, { id, input }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsExperience(id, session.sub);
      const result = await prisma.experience.update({
        ...query,
        where: { id },
        data: {
          company: input.company,
          role: input.role,
          location: input.location ?? null,
          startDate: input.startDate,
          endDate: input.endDate ?? null,
          description: input.description ?? null,
          bullets: input.bullets,
          companyUrl: input.companyUrl ?? null,
          ...(input.order != null ? { order: input.order } : {}),
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("deleteExperience", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsExperience(id, session.sub);
      await prisma.experience.delete({ where: { id } });
      invalidate(session.sub);
      return true;
    },
  })
);
