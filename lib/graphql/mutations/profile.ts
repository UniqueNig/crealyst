import { revalidateTag } from "next/cache";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

const ProfileInput = builder.inputType("ProfileInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    title: t.string({ required: true }),
    tagline: t.string({ required: true }),
    bio: t.string({ required: true }),
    email: t.string({ required: true }),
    location: t.string({ required: false }),
    avatarUrl: t.string({ required: false }),
    resumeUrl: t.string({ required: false }),
    github: t.string({ required: false }),
    linkedin: t.string({ required: false }),
    twitter: t.string({ required: false }),
    instagram: t.string({ required: false }),
    dribbble: t.string({ required: false }),
  }),
});

builder.mutationField("upsertProfile", (t) =>
  t.prismaField({
    type: "Profile",
    args: { input: t.arg({ type: ProfileInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const data = {
        name: input.name,
        title: input.title,
        tagline: input.tagline,
        bio: input.bio,
        email: input.email,
        location: input.location ?? null,
        avatarUrl: input.avatarUrl ?? null,
        resumeUrl: input.resumeUrl ?? null,
        github: input.github ?? null,
        linkedin: input.linkedin ?? null,
        twitter: input.twitter ?? null,
        instagram: input.instagram ?? null,
        dribbble: input.dribbble ?? null,
      };
      // Profile is 1:1 with User (userId is @unique).
      const result = await prisma.profile.upsert({
        ...query,
        where: { userId },
        update: data,
        create: { ...data, userId },
      });
      revalidateTag("profile", { expire: 0 });
      revalidateTag(`profile:user:${userId}`, { expire: 0 });
      revalidateTag("discovery", { expire: 0 });
      return result;
    },
  })
);
