import { revalidateTag } from "next/cache";
import { SkillCategory } from "@prisma/client";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";
import { SKILLS_CATALOG } from "../../skills-catalog";
import { SkillCategoryEnum } from "../types/enums";

const SkillInput = builder.inputType("SkillInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    category: t.field({ type: SkillCategoryEnum, required: true }),
    iconUrl: t.string({ required: false }),
    order: t.int({ required: false }),
  }),
});

function invalidate(userId: string) {
  revalidateTag("skills", { expire: 0 });
  revalidateTag(`skills:user:${userId}`, { expire: 0 });
  revalidateTag(`profile:user:${userId}`, { expire: 0 });
}

async function assertOwnsSkill(id: string, userId: string) {
  const exists = await prisma.skill.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
}

builder.mutationField("createSkill", (t) =>
  t.prismaField({
    type: "Skill",
    args: { input: t.arg({ type: SkillInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const max = await prisma.skill.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.skill.create({
        ...query,
        data: {
          userId,
          name: input.name,
          category: input.category,
          iconUrl: input.iconUrl ?? null,
          order: input.order ?? (max._max.order ?? -1) + 1,
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("updateSkill", (t) =>
  t.prismaField({
    type: "Skill",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: SkillInput, required: true }),
    },
    resolve: async (query, _root, { id, input }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsSkill(id, session.sub);
      const result = await prisma.skill.update({
        ...query,
        where: { id },
        data: {
          name: input.name,
          category: input.category,
          iconUrl: input.iconUrl ?? null,
          ...(input.order != null ? { order: input.order } : {}),
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("deleteSkill", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsSkill(id, session.sub);
      await prisma.skill.delete({ where: { id } });
      invalidate(session.sub);
      return true;
    },
  })
);

builder.mutationField("addSkillFromCatalog", (t) =>
  t.prismaField({
    type: "Skill",
    args: { key: t.arg.string({ required: true }) },
    resolve: async (query, _root, { key }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const catalog = SKILLS_CATALOG.find((s) => s.key === key);
      if (!catalog) throw new Error(`Unknown catalog key: ${key}`);
      // Don't duplicate within THIS user's skills.
      const existing = await prisma.skill.findFirst({
        where: { userId, name: catalog.name },
      });
      if (existing) return existing;
      const max = await prisma.skill.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.skill.create({
        ...query,
        data: {
          userId,
          name: catalog.name,
          category: catalog.category as SkillCategory,
          iconUrl: catalog.iconUrl,
          order: (max._max.order ?? -1) + 1,
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("reorderSkills", (t) =>
  t.boolean({
    args: { ids: t.arg.stringList({ required: true }) },
    resolve: async (_root, { ids }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      // Verify every id belongs to this user before touching anything.
      const owned = await prisma.skill.findMany({
        where: { id: { in: ids }, userId },
        select: { id: true },
      });
      if (owned.length !== ids.length) {
        throw new Error("NOT_FOUND_OR_FORBIDDEN");
      }
      await prisma.$transaction(
        ids.map((id, i) =>
          prisma.skill.update({ where: { id }, data: { order: i } })
        )
      );
      invalidate(session.sub);
      return true;
    },
  })
);
