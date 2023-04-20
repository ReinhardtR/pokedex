import { gql } from "graphql-tag";
import { PokeAPIQuery, fetchPokeAPI } from "./helpers";
import { z } from "zod";
import {
  LAST_POKEMON_ID,
  STAT_DISPLAY_NAMES,
  type StatName,
} from "../../config/pokemon-config";

const getPokemonByIdQuery = {
  input: z.object({
    id: z.number(),
  }),
  output: z.object({
    pokemon_v2_pokemon: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        height: z.number(),
        base_experience: z.number(),
        weight: z.number(),
        pokemon_v2_pokemontypes: z.array(
          z.object({
            slot: z.number(),
            pokemon_v2_type: z.object({
              name: z.string(),
            }),
          })
        ),
        pokemon_v2_pokemonstats: z.array(
          z.object({
            base_stat: z.number(),
            pokemon_v2_stat: z.object({
              name: z.string(),
            }),
          })
        ),
        pokemon_v2_pokemonabilities: z.array(
          z.object({
            slot: z.number(),
            is_hidden: z.boolean(),
            pokemon_v2_ability: z.object({
              name: z.string(),
            }),
          })
        ),
        pokemon_v2_pokemonspecy: z.object({
          pokemon_v2_pokemonspeciesflavortexts: z
            .array(
              z.object({
                flavor_text: z.string(),
              })
            )
            .length(1),
          pokemon_v2_pokemonspeciesnames: z
            .array(
              z.object({
                genus: z.string(),
              })
            )
            .length(1),
          pokemon_v2_evolutionchain: z.object({
            pokemon_v2_pokemonspecies: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                pokemon_v2_pokemonevolutions: z.array(
                  z.object({
                    min_level: z.number().nullable(),
                  })
                ),
              })
            ),
          }),
        }),
      })
    ),
  }),
  query: gql`
    query getPokemonById($id: Int!) {
      pokemon_v2_pokemon(limit: 1, where: { id: { _eq: $id } }) {
        id
        name
        height
        base_experience
        weight
        pokemon_v2_pokemontypes {
          slot
          pokemon_v2_type {
            name
          }
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
            name
          }
        }
        pokemon_v2_pokemonspecy {
          pokemon_v2_pokemonspeciesflavortexts(
            limit: 1
            where: { pokemon_v2_language: { name: { _eq: "en" } } }
          ) {
            flavor_text
          }
          pokemon_v2_pokemonspeciesnames(
            limit: 1
            where: { pokemon_v2_language: { name: { _eq: "en" } } }
          ) {
            genus
          }
          pokemon_v2_evolutionchain {
            pokemon_v2_pokemonspecies(where: { id: { _lte: ${LAST_POKEMON_ID} } }) {
              id
              name
              pokemon_v2_pokemonevolutions {
                min_level
              }
            }
          }
        }
        pokemon_v2_pokemonabilities {
          slot
          is_hidden
          pokemon_v2_ability {
            name
          }
        }
      }
    }
  `,
} satisfies PokeAPIQuery;

export const getPokemonById = async ({ id }: { id: number }) => {
  const data = await fetchPokeAPI(getPokemonByIdQuery, { id });

  const pokemon = data.pokemon_v2_pokemon[0];

  const gif = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;

  const flavorText =
    pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemonspeciesflavortexts[0]
      .flavor_text;

  const genus =
    pokemon.pokemon_v2_pokemonspecy.pokemon_v2_pokemonspeciesnames[0].genus;

  const types = pokemon.pokemon_v2_pokemontypes
    .map((type) => ({
      slot: type.slot,
      name: type.pokemon_v2_type.name,
    }))
    .sort((a, b) => a.slot - b.slot);

  const stats = pokemon.pokemon_v2_pokemonstats.map((stat) => ({
    displayName:
      STAT_DISPLAY_NAMES[stat.pokemon_v2_stat.name as StatName] ?? "Unknown",
    name: stat.pokemon_v2_stat.name,
    value: stat.base_stat,
  }));

  const abilities = pokemon.pokemon_v2_pokemonabilities
    .map((ability) => ({
      name: ability.pokemon_v2_ability.name,
      isHidden: ability.is_hidden,
    }))
    .sort((a, b) => (a.isHidden ? 1 : -1));

  const evolutionChainData =
    pokemon.pokemon_v2_pokemonspecy.pokemon_v2_evolutionchain
      .pokemon_v2_pokemonspecies;
  const evolutionChain =
    evolutionChainData.length > 1
      ? evolutionChainData
          .map((evolution) => ({
            id: evolution.id,
            name: evolution.name,
            gif: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${evolution.id}.gif`,
            minLevel: evolution.pokemon_v2_pokemonevolutions[0]
              ? evolution.pokemon_v2_pokemonevolutions[0].min_level
              : null,
          }))
          .sort((a, b) => a.id - b.id)
      : null;

  return {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    baseEXP: pokemon.base_experience,
    weight: pokemon.weight,
    gif,
    flavorText,
    genus,
    types,
    stats,
    abilities,
    evolutionChain,
  };
};

export type PokemonById = Awaited<ReturnType<typeof getPokemonById>>;
