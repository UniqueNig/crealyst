import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";

// Each cached fetcher is keyed AND tagged by the owning user so different
// tenants get isolated cache entries. Admin mutations call
// `revalidateTag("<resource>:<username>", { expire: 0 })` to invalidate.

const REVALIDATE_SECONDS = 60;

export function getProfile(userId: string) {
  return unstable_cache(
    async () => prisma.profile.findFirst({ where: { userId } }),
    [`profile:${userId}`],
    { tags: ["profile", `profile:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getSkills(userId: string) {
  return unstable_cache(
    async () =>
      prisma.skill.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    [`skills:${userId}`],
    { tags: ["skills", `skills:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getServices(userId: string) {
  return unstable_cache(
    async () =>
      prisma.service.findMany({
        where: { userId, published: true },
        orderBy: { order: "asc" },
      }),
    [`services:${userId}`],
    { tags: ["services", `services:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getFeaturedServices(userId: string) {
  return unstable_cache(
    async () =>
      prisma.service.findMany({
        where: { userId, published: true, featured: true },
        orderBy: { order: "asc" },
        take: 4,
      }),
    [`services-featured:${userId}`],
    { tags: ["services", `services:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getProjects(userId: string) {
  return unstable_cache(
    async () =>
      prisma.project.findMany({
        where: { userId, published: true },
        orderBy: [{ order: "asc" }, { year: "desc" }],
      }),
    [`projects:${userId}`],
    { tags: ["projects", `projects:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getFeaturedProjects(userId: string) {
  return unstable_cache(
    async () =>
      prisma.project.findMany({
        where: { userId, published: true, featured: true },
        orderBy: [{ order: "asc" }, { year: "desc" }],
        take: 4,
      }),
    [`projects-featured:${userId}`],
    { tags: ["projects", `projects:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getProjectBySlug(userId: string, slug: string) {
  return unstable_cache(
    async () =>
      prisma.project.findUnique({
        where: { userId_slug: { userId, slug } },
      }),
    [`project:${userId}:${slug}`],
    {
      tags: ["projects", `projects:user:${userId}`, `project:${userId}:${slug}`],
      revalidate: REVALIDATE_SECONDS,
    }
  )();
}

export function getAllProjectSlugs(userId: string) {
  return unstable_cache(
    async () =>
      prisma.project.findMany({
        where: { userId, published: true },
        select: { slug: true },
      }),
    [`project-slugs:${userId}`],
    { tags: ["projects", `projects:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getExperience(userId: string) {
  return unstable_cache(
    async () =>
      prisma.experience.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { startDate: "desc" }],
      }),
    [`experience:${userId}`],
    { tags: ["experience", `experience:user:${userId}`], revalidate: REVALIDATE_SECONDS }
  )();
}

export function getEducation(userId: string) {
  return unstable_cache(
    async () =>
      prisma.education.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    [`education-list:${userId}`],
    {
      tags: ["education-list", `education-list:user:${userId}`],
      revalidate: REVALIDATE_SECONDS,
    }
  )();
}

export function getCertifications(userId: string) {
  return unstable_cache(
    async () =>
      prisma.certification.findMany({
        where: { userId },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    [`certifications:${userId}`],
    {
      tags: ["certifications", `certifications:user:${userId}`],
      revalidate: REVALIDATE_SECONDS,
    }
  )();
}
