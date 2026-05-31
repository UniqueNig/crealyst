import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

async function assertOwnsMessage(id: string, userId: string) {
  const exists = await prisma.contactMessage.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
}

builder.mutationField("markMessageRead", (t) =>
  t.prismaField({
    type: "ContactMessage",
    args: {
      id: t.arg.string({ required: true }),
      read: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _root, { id, read }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsMessage(id, session.sub);
      return prisma.contactMessage.update({
        ...query,
        where: { id },
        data: { read },
      });
    },
  })
);

builder.mutationField("deleteMessage", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsMessage(id, session.sub);
      await prisma.contactMessage.delete({ where: { id } });
      return true;
    },
  })
);
