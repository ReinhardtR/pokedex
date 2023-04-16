import { DocumentNode } from "graphql/language/ast";
import { z } from "zod";
import { print } from "graphql";

export type PokeAPIQuery = {
  input: z.ZodSchema;
  output: z.ZodSchema;
  query: DocumentNode;
};

export async function fetchPokeAPI<TQuery extends PokeAPIQuery>(
  query: TQuery,
  variables: z.infer<TQuery["input"]>
): Promise<z.infer<TQuery["output"]>> {
  const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "max-age=31536000",
    },
    body: JSON.stringify({
      query: print(query.query),
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data from PokeAPI");
  }

  const { data } = await response.json();
  const parsed = query.output.safeParse(data);

  if (!parsed.success) {
    throw new Error("Failed to parse data from PokeAPI");
  }

  return parsed.data;
}
