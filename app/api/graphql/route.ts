import { createYoga } from "graphql-yoga";
import { schema } from "@/lib/graphql/schema";
import { getSession } from "@/lib/auth";
import type { GraphQLContext } from "@/lib/graphql/builder";

const { handleRequest } = createYoga<{
  req: Request;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  context: async (): Promise<GraphQLContext> => {
    const session = await getSession();
    return { session };
  },
});

export async function GET(request: Request) {
  return handleRequest(request, { req: request });
}

export async function POST(request: Request) {
  return handleRequest(request, { req: request });
}

export async function OPTIONS(request: Request) {
  return handleRequest(request, { req: request });
}
