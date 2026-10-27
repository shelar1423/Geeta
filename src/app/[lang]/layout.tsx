import { LANGUAGES } from "@/lib/types";
import { parseLang } from "@/lib/params";

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = parseLang((await params).lang);
  return (
    <div lang={lang} className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
