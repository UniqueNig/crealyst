import { revalidateTag } from "next/cache";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

const EducationInput = builder.inputType("EducationInput", {
  fields: (t) => ({
    school: t.string({ required: true }),
    degree: t.string({ required: true }),
    range: t.string({ required: true }),
    location: t.string({ required: false }),
    description: t.string({ required: false }),
    order: t.int({ required: false }),
  }),
});

function invalidate(userId: string) {
  revalidateTag("education-list", { expire: 0 });
  revalidateTag(`education-list:user:${userId}`, { expire: 0 });
}

async function assertOwnsEducation(id: string, userId: string) {
  const exists = await prisma.education.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
}

builder.mutationField("createEducation", (t) =>
  t.prismaField({
    type: "Education",
    args: { input: t.arg({ type: EducationInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const max = await prisma.education.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.education.create({
        ...query,
        data: {
          userId,
          school: input.school,
          degree: input.degree,
          range: input.range,
          location: input.location ?? null,
          description: input.description ?? null,
          order: input.order ?? (max._max.order ?? -1) + 1,
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("updateEducation", (t) =>
  t.prismaField({
    type: "Education",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: EducationInput, required: true }),
    },
    resolve: async (query, _root, { id, input }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsEducation(id, session.sub);
      const result = await prisma.education.update({
        ...query,
        where: { id },
        data: {
          school: input.school,
          degree: input.degree,
          range: input.range,
          location: input.location ?? null,
          description: input.description ?? null,
          ...(input.order != null ? { order: input.order } : {}),
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("deleteEducation", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsEducation(id, session.sub);
      await prisma.education.delete({ where: { id } });
      invalidate(session.sub);
      return true;
    },
  })
);
