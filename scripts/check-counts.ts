import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const totals = {
    user: await p.user.count(),
    profile: await p.profile.count(),
    skill: await p.skill.count(),
    service: await p.service.count(),
    project: await p.project.count(),
    experience: await p.experience.count(),
    education: await p.education.count(),
    certification: await p.certification.count(),
    contactMessage: await p.contactMessage.count(),
  };
  console.log("Totals:", totals);

  const linked = {
    profile: await p.profile.count({ where: { userId: { not: null } } }),
    skill: await p.skill.count({ where: { userId: { not: null } } }),
    service: await p.service.count({ where: { userId: { not: null } } }),
    project: await p.project.count({ where: { userId: { not: null } } }),
    experience: await p.experience.count({ where: { userId: { not: null } } }),
    education: await p.education.count({ where: { userId: { not: null } } }),
    certification: await p.certification.count({ where: { userId: { not: null } } }),
    contactMessage: await p.contactMessage.count({ where: { userId: { not: null } } }),
  };
  console.log("Linked to a user:", linked);

  const orphans = {
    profile: totals.profile - linked.profile,
    skill: totals.skill - linked.skill,
    service: totals.service - linked.service,
    project: totals.project - linked.project,
    experience: totals.experience - linked.experience,
    education: totals.education - linked.education,
    certification: totals.certification - linked.certification,
    contactMessage: totals.contactMessage - linked.contactMessage,
  };
  console.log("Orphaned (need userId):", orphans);
}

main().finally(() => p.$disconnect());
