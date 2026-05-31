import { builder } from "../builder";
import { SkillCategoryEnum } from "./enums";

builder.prismaObject("Skill", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    category: t.expose("category", { type: SkillCategoryEnum }),
    iconUrl: t.exposeString("iconUrl", { nullable: true }),
    order: t.exposeInt("order"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});
