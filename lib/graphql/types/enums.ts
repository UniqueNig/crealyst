import { SkillCategory } from "@prisma/client";
import { builder } from "../builder";

export const SkillCategoryEnum = builder.enumType(SkillCategory, {
  name: "SkillCategory",
});
