import { revalidateTag } from "next/cache";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

const ProjectInput = builder.inputType("ProjectInput", {
  fields: (t) => ({
    slug: t.string({ required: true }),
    title: t.string({ required: true }),
    summary: t.string({ required: true }),
    description: t.string({ required: true }),
    role: t.string({ required: true }),
    year: t.int({ required: true }),
    liveUrl: t.string({ required: false }),
    repoUrl: t.string({ required: false }),
    coverImage: t.string({ required: true }),
    gallery: t.stringList({ required: true }),
    techStack: t.stringList({ required: true }),
    tags: t.stringList({ required: false }),
    order: t.int({ required: false }),
    featured: t.boolean({ required: false }),
    published: t.boolean({ required: false }),
    metaTitle: t.string({ required: false }),
    metaDesc: t.string({ required: false }),
  }),
});

function invalidate(userId: string, slug?: string) {
  revalidateTag("projects", { expire: 0 });
  revalidateTag(`projects:user:${userId}`, { expire: 0 });
  if (slug) revalidateTag(`project:${userId}:${slug}`, { expire: 0 });
}

async function assertOwnsProject(id: string, userId: string) {
  const exists = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true, slug: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
  return exists;
}

builder.mutationField("createProject", (t) =>
  t.prismaField({
    type: "Project",
    args: { input: t.arg({ type: ProjectInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const max = await prisma.project.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.project.create({
        ...query,
        data: {
          userId,
          slug: input.slug,
          title: input.title,
          summary: input.summary,
          description: input.description,
          role: input.role,
          year: input.year,
          liveUrl: input.liveUrl ?? null,
          repoUrl: input.repoUrl ?? null,
          coverImage: input.coverImage,
          gallery: input.gallery,
          techStack: input.techStack,
          tags: input.tags ?? [],
          order: input.order ?? (max._max.order ?? -1) + 1,
          featured: input.featured ?? false,
          published: input.published ?? true,
          metaTitle: input.metaTitle ?? null,
          metaDesc: input.metaDesc ?? null,
        },
      });
      invalidate(session.sub, result.slug);
      return result;
    },
  })
);

builder.mutationField("updateProject", (t) =>
  t.prismaField({
    type: "Project",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: ProjectInput, required: true }),
    },
    resolve: async (query, _root, { id, input }, ctx) => {
      const session = requireAdmin(ctx);
      const before = await assertOwnsProject(id, session.sub);
      const result = await prisma.project.update({
        ...query,
        where: { id },
        data: {
          slug: input.slug,
          title: input.title,
          summary: input.summary,
          description: input.description,
          role: input.role,
          year: input.year,
          liveUrl: input.liveUrl ?? null,
          repoUrl: input.repoUrl ?? null,
          coverImage: input.coverImage,
          gallery: input.gallery,
          techStack: input.techStack,
          tags: input.tags ?? [],
          ...(input.order != null ? { order: input.order } : {}),
          ...(input.featured != null ? { featured: input.featured } : {}),
          ...(input.published != null ? { published: input.published } : {}),
          metaTitle: input.metaTitle ?? null,
          metaDesc: input.metaDesc ?? null,
        },
      });
      invalidate(session.sub, result.slug);
      if (before.slug !== result.slug) invalidate(session.sub, before.slug);
      return result;
    },
  })
);

builder.mutationField("deleteProject", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      const before = await assertOwnsProject(id, session.sub);
      await prisma.project.delete({ where: { id } });
      invalidate(session.sub, before.slug);
      return true;
    },
  })
);
