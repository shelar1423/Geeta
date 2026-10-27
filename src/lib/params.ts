import { notFound } from "next/navigation";
import { LANGUAGES, type Lang } from "./types";

export function parseLang(value: string): Lang {
  if (!(LANGUAGES as readonly string[]).includes(value)) notFound();
  return value as Lang;
}
