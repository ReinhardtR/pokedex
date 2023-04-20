import { gql } from "graphql-tag";
import { PokeAPIQuery, fetchPokeAPI } from "./helpers";
import { z } from "zod";
import { LAST_POKEMON_ID } from "../../config/pokemon-config";

const getPokemonsListQuery = {
  input: z.object({
    limit: z.number(),
    offset: z.number(),
    search: z.string(),
  }),
  output: z.object({
    pokemon_v2_pokemon_aggregate: z.object({
      aggregate: z.object({
        count: z.number(),
      }),
    }),
    pokemon_v2_pokemon: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        pokemon_v2_pokemontypes: z.array(
          z.object({
            slot: z.number(),
            pokemon_v2_type: z.object({
              name: z.string(),
            }),
          })
        ),
      })
    ),
  }),
  query: gql`
    query getPokemonsList($limit: Int!, $offset: Int!, $search: String) {
      pokemon_v2_pokemon_aggregate(where: {id: {_lte: ${LAST_POKEMON_ID} }, name: {_regex: $search }
      }) {
        aggregate {
          count
        }
      }
      pokemon_v2_pokemon(
        limit: $limit,
        offset: $offset,
        where: { 
          id: { _lte: ${LAST_POKEMON_ID} },
          name: { _regex: $search },
        }
      ) {
        id
        name
        pokemon_v2_pokemontypes {
          slot
          pokemon_v2_type {
            name
          }
        }
      }
    }
  `,
} satisfies PokeAPIQuery;

export const getPokemonsList = async ({
  limit,
  offset,
  search,
}: {
  limit: number;
  offset: number;
  search: string;
}) => {
  const data = await fetchPokeAPI(getPokemonsListQuery, {
    limit,
    offset,
    search,
  });

  const pokemons = data.pokemon_v2_pokemon.map((pokemon) => {
    const types = pokemon.pokemon_v2_pokemontypes
      .map((type) => ({
        slot: type.slot,
        name: type.pokemon_v2_type.name,
      }))
      .sort((a, b) => a.slot - b.slot);

    return {
      id: pokemon.id,
      name: pokemon.name,
      gif: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`,
      types,
    };
  });

  return {
    count: data.pokemon_v2_pokemon_aggregate.aggregate.count,
    pokemons,
  };
};
