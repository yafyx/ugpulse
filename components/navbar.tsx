"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, HeartFilledIcon, Logo } from "@/components/icons";
import clsx from "clsx";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Style to remove blue highlight when clicking
  const noTapHighlight = "tap-highlight-transparent focus:outline-none";

  return (
    <NextUINavbar
      maxWidth="full"
      position="sticky"
      isBordered
      className="bg-transparent px-2 sm:px-8"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          <NextLink
            className={`flex items-center justify-start gap-1 ${noTapHighlight}`}
            href="/"
            onClick={handleLinkClick}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <p className="text-xl font-bold text-inherit">UG-PULSE.</p>
          </NextLink>
        </NavbarBrand>
        <ul className="ml-2 hidden justify-start gap-4 lg:flex">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "data-[active=true]:font-medium data-[active=true]:text-primary",
                  noTapHighlight,
                )}
                color="foreground"
                href={item.href}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden basis-1/5 sm:flex sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden gap-2 sm:flex">
          <Link
            isExternal
            aria-label="Github"
            href={siteConfig.links.github}
            className={noTapHighlight}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className={`bg-default-100 text-sm font-normal text-default-600 ${noTapHighlight}`}
            href={siteConfig.links.sponsor}
            variant="flat"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            support me
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="basis-1 pl-4 sm:hidden" justify="end">
        <Link
          isExternal
          aria-label="Github"
          href={siteConfig.links.github}
          className={noTapHighlight}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={noTapHighlight}
        />
      </NavbarContent>

      <NavbarMenu className="pt-6">
        {siteConfig.navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <NextLink
              href={item.href}
              onClick={handleLinkClick}
              className={`block w-full py-2 text-lg transition-colors hover:text-primary ${noTapHighlight}`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {item.label}
            </NextLink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button
            isExternal
            as={Link}
            className={`mt-4 w-full justify-center bg-default-100 text-sm font-normal text-default-600 ${noTapHighlight}`}
            href={siteConfig.links.sponsor}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            Sponsor
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
};
