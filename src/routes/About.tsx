import { Stack, Text } from "@mantine/core";

export function About() {
  return (
    <Stack align="center" justify="center">
      <Text size="xl">This is a Pokédex app built with React.</Text>
      <Text size="xl">
        It uses the PokéAPI GraphQL-endpoint to fetch data about Pokémon.
      </Text>
      <Text size="xl">UI is built with a mixture of Mantine and Tailwind.</Text>
    </Stack>
  );
}
