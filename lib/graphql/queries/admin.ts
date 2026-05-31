import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

// Every admin query is scoped to the calling user's own data via `userId`.

builder.queryField("adminSkills", (t) =>
  t.prismaField({
    type: ["Skill"],
    resolve: (query, _root, _args, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.skill.findMany({
        ...query,
        where: { userId },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });
    },
  })
);

builder.queryField("adminServices", (t) =>
  t.prismaField({
    type: ["Service"],
    resolve: (query, _root, _args, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.service.findMany({
        ...query,
        where: { userId },
        orderBy: { order: "asc" },
      });
    },
  })
);

builder.queryField("adminService", (t) =>
  t.prismaField({
    type: "Service",
    nullable: true,
    args: { id: t.arg.string({ required: true }) },
    resolve: (query, _root, { id }, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.service.findFirst({
        ...query,
        where: { id, userId },
      });
    },
  })
);

builder.queryField("adminProjects", (t) =>
  t.prismaField({
    type: ["Project"],
    resolve: (query, _root, _args, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.project.findMany({
        ...query,
        where: { userId },
        orderBy: [{ order: "asc" }, { year: "desc" }],
      });
    },
  })
);

builder.queryField("adminProject", (t) =>
  t.prismaField({
    type: "Project",
    nullable: true,
    args: { id: t.arg.string({ required: true }) },
    resolve: (query, _root, { id }, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.project.findFirst({
        ...query,
        where: { id, userId },
      });
    },
  })
);

builder.queryField("adminExperience", (t) =>
  t.prismaField({
    type: ["Experience"],
    resolve: (query, _root, _args, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.experience.findMany({
        ...query,
        where: { userId },
        orderBy: [{ order: "asc" }, { startDate: "desc" }],
      });
    },
  })
);

builder.queryField("adminMessages", (t) =>
  t.prismaField({
    type: ["ContactMessage"],
    resolve: (query, _root, _args, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.contactMessage.findMany({
        ...query,
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

builder.queryField("adminUnreadMessageCount", (t) =>
  t.int({
    resolve: (_root, _args, ctx) => {
      const { sub: userId } = requireAdmin(ctx);
      return prisma.contactMessage.count({
        where: { userId, read: false },
      });
    },
  })
);

type AdminStats = {
  projects: number;
  services: number;
  skills: number;
  experience: number;
  messages: number;
  unreadMessages: number;
};

const AdminStatsRef = builder.objectRef<AdminStats>("AdminStats").implement({
  fields: (t) => ({
    projects: t.exposeInt("projects"),
    services: t.exposeInt("services"),
    skills: t.exposeInt("skills"),
    experience: t.exposeInt("experience"),
    messages: t.exposeInt("messages"),
    unreadMessages: t.exposeInt("unreadMessages"),
  }),
});

builder.queryField("adminStats", (t) =>
  t.field({
    type: AdminStatsRef,
    resolve: async (_root, _args, ctx): Promise<AdminStats> => {
      const { sub: userId } = requireAdmin(ctx);
      const [projects, services, skills, experience, messages, unreadMessages] =
        await Promise.all([
          prisma.project.count({ where: { userId } }),
          prisma.service.count({ where: { userId } }),
          prisma.skill.count({ where: { userId } }),
          prisma.experience.count({ where: { userId } }),
          prisma.contactMessage.count({ where: { userId } }),
          prisma.contactMessage.count({ where: { userId, read: false } }),
        ]);
      return { projects, services, skills, experience, messages, unreadMessages };
    },
  })
);
