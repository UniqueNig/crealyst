import { builder } from "./builder";

// Scalars + enums must register before any object types that reference them.
import "./types/enums";

// Object types
import "./types/profile";
import "./types/skill";
import "./types/service";
import "./types/project";
import "./types/experience";
import "./types/contact-message";
import "./types/education";
import "./types/certification";

// Queries
import "./queries/meta";
import "./queries/admin";

// Mutations
import "./mutations/profile";
import "./mutations/skill";
import "./mutations/service";
import "./mutations/project";
import "./mutations/experience";
import "./mutations/message";
import "./mutations/education";
import "./mutations/certification";

export const schema = builder.toSchema();
