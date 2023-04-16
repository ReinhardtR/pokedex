import {
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { LoaderData } from "../utils/loader-data-types";
import { getPokemonsList } from "../lib/pokeapi/get-pokemons-list";
import {
  Paper,
  Image,
  SimpleGrid,
  Text,
  Center,
  Flex,
  Group,
  Badge,
  TextInput,
  Stack,
  Loader,
  Progress,
  Button,
  Pagination,
} from "@mantine/core";
import {
  POKEMON_TYPE_COLOR_MAP,
  PokemonType,
  getPokemonIdString,
} from "../utils/pokemon-utils";
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useDebounce } from "../lib/hooks/use-debounce";
import { PokemonById, getPokemonById } from "../lib/pokeapi/get-pokemon-by-id";
import {
  BASE_EXP_SCALE,
  HEIGHT_SCALE,
  LAST_POKEMON_ID,
  STATS_SCALE,
  WEIGHT_SCALE,
} from "../config/pokemon-config";

const LIST_LIMIT = 15;

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;

  if (page < 1 || page > LAST_POKEMON_ID / LIST_LIMIT + 1) {
    return redirect("/");
  }

  const pokemons = await getPokemonsList({
    limit: LIST_LIMIT,
    offset: (page - 1) * LIST_LIMIT,
    search,
  });

  return {
    pokemons,
  };
}

export function Home() {
  const { pokemons } = useLoaderData() as LoaderData<typeof loader>;

  return (
    <Center>
      <Group align="start">
        <Stack spacing={40}>
          <PokemonSearchBar />
          <SimpleGrid cols={3} spacing="xl" verticalSpacing={56}>
            {pokemons.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </SimpleGrid>
          <PaginationButtons />
        </Stack>
        <PokemonSpotlight />
      </Group>
    </Center>
  );
}

function PaginationButtons() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  return (
    <Pagination
      color="red"
      total={LAST_POKEMON_ID / LIST_LIMIT + 1}
      position="center"
      value={currentPage}
      grow
      withEdges
      onChange={(newPage) => {
        setSearchParams((sp) => {
          sp.set("page", newPage.toString());
          return sp;
        });
      }}
    />
  );
}

function PokemonSpotlight() {
  const [pokemon, setPokemon] = useState<PokemonById | null>(null);
  const [searchParams] = useSearchParams();

  const selectedId = searchParams.get("id");

  // should probably use swr or tanstack-query here
  // but this keeps it simple for now
  useEffect(() => {
    let ignore = false;

    let pokemonId = 1;

    if (selectedId) {
      const selectedIdNum = Number(selectedId);
      if (
        !isNaN(selectedIdNum) &&
        selectedIdNum > 0 &&
        selectedIdNum <= LAST_POKEMON_ID
      ) {
        pokemonId = selectedIdNum;
      }
    }

    if (pokemonId === pokemon?.id) return;

    getPokemonById({
      id: pokemonId,
    }).then((p) => {
      if (ignore) return;
      setPokemon(p);
    });

    return () => {
      ignore = true;
    };
  }, [selectedId, pokemon?.id]);

  return (
    <Paper
      w={300}
      mih={300}
      mt={90}
      shadow="lg"
      radius="xl"
      className="flex justify-center"
    >
      {pokemon ? (
        <Stack align="center" pos="relative">
          <img
            src={pokemon.gif}
            alt={`GIF of ${pokemon.name}`}
            className="absolute object-scale-down scale-[1.8] inset-0 mx-auto pb-20"
          />

          <Stack pt={90} align="center" justify="center" spacing={32} px={18}>
            <Stack align="center" spacing={2}>
              <Text c="dimmed" fw="bold" fz="md">
                {getPokemonIdString(pokemon.id)}
              </Text>
              <Text fw="bolder" fz={24} transform="capitalize">
                {pokemon.name}
              </Text>
              <Text c="dimmed" fz="sm" fw={500}>
                {pokemon.genus}
              </Text>
              <Group pt={8} spacing={6}>
                {pokemon.types.map((type) => (
                  <Badge
                    key={type.name}
                    bg={POKEMON_TYPE_COLOR_MAP[type.name as PokemonType]}
                    variant="filled"
                    radius="md"
                    p="sm"
                    className="text-opacity-80 text-black"
                    fw="bolder"
                  >
                    {type.name}
                  </Badge>
                ))}
              </Group>
            </Stack>

            <Stack align="center" spacing={4}>
              <Text fw="bolder">POKÉDEX ENTRY</Text>
              <Text align="center" fz={14}>
                {pokemon.flavorText}
              </Text>
            </Stack>

            <Stack spacing={4}>
              <Text fw="bolder" align="center">
                ABILITIES
              </Text>
              <SimpleGrid cols={2} spacing="sm" verticalSpacing={4}>
                {pokemon.abilities.map((ability) => (
                  <Badge
                    key={ability.name}
                    variant="outline"
                    size="lg"
                    className="capitalize"
                    color={ability.isHidden ? "red" : "blue"}
                  >
                    {ability.name}
                  </Badge>
                ))}
              </SimpleGrid>
            </Stack>

            <Stack spacing={4} className="self-stretch">
              <Text fw="bolder" align="center">
                METRICS
              </Text>

              <PokemonProgressBar
                label={`${pokemon.height / 10}m`}
                value={pokemon.height}
                max={HEIGHT_SCALE}
              />

              <PokemonProgressBar
                label={`${pokemon.weight / 10}kg`}
                value={pokemon.weight}
                max={WEIGHT_SCALE}
              />

              <PokemonProgressBar
                label={`${pokemon.baseEXP} EXP`}
                value={pokemon.baseEXP}
                max={BASE_EXP_SCALE}
              />
            </Stack>

            <Stack spacing={4} className="self-stretch">
              <Text fw="bolder" align="center">
                STATS
              </Text>

              {pokemon.stats.map((stat) => (
                <PokemonProgressBar
                  key={stat.name}
                  label={`${stat.value} ${stat.displayName}`}
                  value={stat.value}
                  max={STATS_SCALE}
                />
              ))}
            </Stack>

            {pokemon.evolutionChain && (
              <Stack spacing={4}>
                <Text fw="bolder" align="center">
                  EVOLUTION CHAIN
                </Text>

                <Group spacing={0}>
                  {pokemon.evolutionChain.map((evolution, index) => (
                    <Fragment key={evolution.id}>
                      <img
                        src={evolution.gif}
                        className="object-scale-down scale-[0.6] w-12 h-12"
                        alt={evolution.name}
                      />
                      {index < pokemon.evolutionChain!.length - 1 && (
                        <Badge color="gray" size="xs">
                          Lvl {pokemon.evolutionChain![index + 1].minLevel}
                        </Badge>
                      )}
                    </Fragment>
                  ))}
                </Group>
              </Stack>
            )}
          </Stack>
        </Stack>
      ) : (
        <Loader className="self-center" />
      )}
    </Paper>
  );
}

function PokemonSearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams((sp) => {
        sp.set("q", debouncedQuery);
        return sp;
      });
    } else {
      setSearchParams((sp) => {
        sp.delete("q");
        return sp;
      });
    }
  }, [debouncedQuery, setSearchParams]);

  return (
    <TextInput
      name="q"
      aria-label="Search by name"
      placeholder="Search by name"
      icon={<SearchIcon />}
      size="lg"
      radius="lg"
      value={query}
      onChange={(event) => setQuery(event.currentTarget.value)}
    />
  );
}

type CardProps = {
  pokemon: {
    id: number;
    name: string;
    gif: string;
    types: {
      name: string;
    }[];
  };
};

function PokemonCard(props: CardProps) {
  const { pokemon } = props;
  const [, setSearchParams] = useSearchParams();

  return (
    <Paper
      onClick={() => {
        setSearchParams((sp) => {
          sp.set("id", pokemon.id.toString());
          return sp;
        });
      }}
      radius="xl"
      shadow="lg"
      w={240}
      h={170}
      className="hover:scale-105 hover:cursor-pointer transition-transform"
    >
      <Flex direction="column" align="center" justify="center" pos="relative">
        <Image
          src={pokemon.gif}
          alt={`GIF of ${pokemon.name}`}
          fit="scale-down"
          inset={0}
          height={100}
          width={100}
          mt={-30}
          mx="auto"
          pos="absolute"
        />
        <Flex direction="column" align="center" justify="center" pt={70}>
          <Text c="dimmed" fw="bold" fz="sm">
            {getPokemonIdString(pokemon.id)}
          </Text>
          <Text fw="bolder" fz="md" transform="capitalize" c="">
            {pokemon.name}
          </Text>
          <Group pt={8} spacing={6}>
            {pokemon.types.map((type) => (
              <Badge
                key={type.name}
                bg={POKEMON_TYPE_COLOR_MAP[type.name as PokemonType]}
                variant="filled"
                radius="md"
                p="sm"
                className="text-opacity-80 text-black"
                fw="bolder"
              >
                {type.name}
              </Badge>
            ))}
          </Group>
        </Flex>
      </Flex>
    </Paper>
  );
}

type PokemonProgressBarProps = {
  label: string;
  value: number;
  max: number;
};

function PokemonProgressBar(props: PokemonProgressBarProps) {
  const percentage = (props.value / props.max) * 100;

  return (
    <div className="relative flex flex-col items-center">
      <Text fz="sm" fw={600}>
        {props.label}
      </Text>
      <Progress
        className="self-stretch"
        value={(props.value / props.max) * 100}
        size="md"
        color={getProgressColor(percentage)}
        striped
        animate={percentage >= 100}
      />
    </div>
  );
}

function getProgressColor(percentage: number) {
  if (percentage > 75) return "#00CC00";
  else if (percentage > 50) return "#FFFF00";
  else if (percentage > 25) return "#FFA500";
  else return "#FF0000";
}
