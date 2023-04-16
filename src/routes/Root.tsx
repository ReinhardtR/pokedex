import {
  ActionIcon,
  AppShell,
  Group,
  Header,
  Image,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { GithubIcon, MoonIcon, SunIcon } from "lucide-react";
import { Outlet, Link, NavLink as RouterNavLink } from "react-router-dom";

export default function Root() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60}>
          <Group sx={{ height: "100%" }} px={20} position="apart">
            <Link to="/">
              <Group spacing="xs">
                <Image src="/pokeball.png" height={32} width={32} />
                <Text fz="xl" fw="bold">
                  Pokédex
                </Text>
              </Group>
            </Link>

            <Group spacing={24} align="center">
              <NavLink to="/" display="Home" />
              <NavLink to="/about" display="About" />
            </Group>

            <Group>
              <ActionIcon variant="default" size={32}>
                <a
                  href="https://github.com/ReinhardtR/pokedex-cra"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon size="1.2rem" />
                </a>
              </ActionIcon>

              <ActionIcon
                variant="default"
                onClick={() => toggleColorScheme()}
                size={32}
              >
                {colorScheme === "dark" ? (
                  <SunIcon size="1.2rem" />
                ) : (
                  <MoonIcon size="1.2rem" />
                )}
              </ActionIcon>
            </Group>
          </Group>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.gray[1],
        },
      })}
    >
      <Outlet />
    </AppShell>
  );
}

type NavLinkProps = {
  to: string;
  display: string;
};

function NavLink({ to, display }: NavLinkProps) {
  const theme = useMantineTheme();

  const activeStyles = {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[2]
        : theme.colors.dark[6],
    fontWeight: 700,
  };

  const pendingStyles = {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[5]
        : theme.colors.gray[6],
    fontWeight: 700,
    cursor: "not-allowed",
  };

  const defaultStyles = {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[5]
        : theme.colors.gray[6],
    fontWeight: 500,
  };

  return (
    <RouterNavLink to={to}>
      {({ isActive, isPending }) => (
        <Text
          style={{
            ...defaultStyles,
            ...(isActive ? activeStyles : {}),
            ...(isPending ? pendingStyles : {}),
          }}
        >
          {display}
        </Text>
      )}
    </RouterNavLink>
  );
}
