"use client";

// import nextjs and react
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// import recharts components
import { Label } from "recharts";

// import context and scripts
import { esp, getToken } from "@/lib/context";
import { useAllEsp } from "@/lib/data";
import { validateIp } from "@/lib/utils";

// import lucide icons
import { CirclePlus } from "lucide-react";

// import shacl-ui components
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export default function EspLinksElement() {
  const pathname = usePathname();

  const links = useAllEsp();
  const [allLinks, setAllLinks] = useState<esp[]>(links);
  const [newLink, setNewLink] = useState({ name: "", ip: "" });

  useEffect(() => {
    setAllLinks(links);
  }, [links]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLink({ ...newLink, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/postgrest/esp`;

    if (!validateIp(newLink.ip)) {
      alert("L'adresse IP n'est pas valide");
      return;
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...newLink,
          ip: newLink.ip, // Send IP as a string
        }),
      });

      if (!response.ok) {
        Error("Erreur lors de l'envoi des données à l'API");
      }

      const responseData = await response.json();
      const newLinks = Array.isArray(responseData)
          ? responseData.flat()
          : [responseData];

      setAllLinks([...allLinks, ...newLinks]);
      setNewLink({ name: "", ip: "" });
    } catch (e) {
      console.error("Une erreur s'est produite :", e);
    }
  };

  return (
    <>
      {allLinks.map((link) => {
        const href = `/dashboard/esp/${link.id}`;
        return (
          <Link
            key={link.id}
            href={href}
            className={clsx(
              "flex items-center gap-3 rounded-lg py-2 text-lg text-gray-500 transition-all hover:text-primary",
              {
                "text-zinc-950 dark:text-zinc-50": pathname === href,
              },
            )}
          >
            <p className="text-lg">{link.name}</p>
          </Link>
        );
      })}
      <div className="mb-3 border-b-2 dark:border-gray-400" />
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex w-full justify-between text-start text-lg text-zinc-500 hover:text-black dark:hover:text-zinc-200">
            <p>ajouter un esp</p>
            <CirclePlus className="mt-1 w-[20px]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="mx-5">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label>name</Label>
              <Input
                type="text"
                id="name"
                placeholder="name"
                value={newLink.name}
                onChange={handleInputChange}
                required
              />

              <Label>ip address</Label>
              <Input
                type="text"
                id="ip"
                placeholder="ip address"
                value={newLink.ip}
                onChange={handleInputChange}
                required={true}
              />
            </div>
            <Button
              className="mt-2 w-full bg-white text-black dark:bg-zinc-700 dark:text-white dark:hover:bg-black"
              type="submit"
              variant="outline"
            >
              Ajouter un esp
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </>
  );
}
