import { ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CATEGORIES } from "@/lib/data/products"
import { cn } from "@/lib/utils"

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Categorías" title="Elegí tu flow" />
      <div className="mt-10 grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[260px] md:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.id}
            href={`/tienda?categoria=${c.id}`}
            className={cn(
              "group relative isolate overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === 0 && "col-span-2 row-span-2",
              i === 1 && "col-span-2 md:col-span-2",
            )}
          >
            <Image
              src={c.image}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: c.position }}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="flex h-full flex-col justify-end p-5">
              <h3 className={cn("font-display text-white", i === 0 ? "text-6xl" : "text-4xl")}>{c.label}</h3>
              <p className="mt-1 text-sm text-white/75">{c.blurb}</p>
            </div>
            <ArrowUpRightIcon className="absolute top-4 right-4 size-6 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">{eyebrow}</p>
        <h2 className="font-display text-5xl text-balance sm:text-6xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}
