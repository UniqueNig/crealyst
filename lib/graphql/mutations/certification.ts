import { revalidateTag } from "next/cache";
import { builder, requireAdmin } from "../builder";
import { prisma } from "../../prisma";

const CertificationInput = builder.inputType("CertificationInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    issuer: t.string({ required: true }),
    year: t.string({ required: true }),
    credentialUrl: t.string({ required: false }),
    order: t.int({ required: false }),
  }),
});

function invalidate(userId: string) {
  revalidateTag("certifications", { expire: 0 });
  revalidateTag(`certifications:user:${userId}`, { expire: 0 });
}

async function assertOwnsCertification(id: string, userId: string) {
  const exists = await prisma.certification.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists) throw new Error("NOT_FOUND_OR_FORBIDDEN");
}

builder.mutationField("createCertification", (t) =>
  t.prismaField({
    type: "Certification",
    args: { input: t.arg({ type: CertificationInput, required: true }) },
    resolve: async (query, _root, { input }, ctx) => {
      const session = requireAdmin(ctx);
      const userId = session.sub;
      const max = await prisma.certification.aggregate({
        _max: { order: true },
        where: { userId },
      });
      const result = await prisma.certification.create({
        ...query,
        data: {
          userId,
          name: input.name,
          issuer: input.issuer,
          year: input.year,
          credentialUrl: input.credentialUrl ?? null,
          order: input.order ?? (max._max.order ?? -1) + 1,
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("updateCertification", (t) =>
  t.prismaField({
    type: "Certification",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: CertificationInput, required: true }),
    },
    resolve: async (query, _root, { id, input }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsCertification(id, session.sub);
      const result = await prisma.certification.update({
        ...query,
        where: { id },
        data: {
          name: input.name,
          issuer: input.issuer,
          year: input.year,
          credentialUrl: input.credentialUrl ?? null,
          ...(input.order != null ? { order: input.order } : {}),
        },
      });
      invalidate(session.sub);
      return result;
    },
  })
);

builder.mutationField("deleteCertification", (t) =>
  t.boolean({
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, { id }, ctx) => {
      const session = requireAdmin(ctx);
      await assertOwnsCertification(id, session.sub);
      await prisma.certification.delete({ where: { id } });
      invalidate(session.sub);
      return true;
    },
  })
);
