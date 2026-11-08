const BRANDS = ["Nike", "Puma", "New Balance", "Jordan", "New Era", "Hi-Tec", "DRYX"]

export function BrandMarquee() {
  const row = [...BRANDS, ...BRANDS]
  return (
    <section aria-label="Marcas disponibles" className="overflow-hidden border-y border-border bg-card/40 py-5">
      <div className="flex w-max animate-marquee [--marquee-duration:35s]">
        {[0, 1].map((k) => (
          <ul key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {row.map((b, i) => (
              <li key={i} className="flex items-center gap-10 px-5 font-display text-3xl text-muted-foreground sm:text-4xl">
                <span className={b === "DRYX" ? "text-foreground" : undefined}>
                  {b === "DRYX" ? (
                    <>
                      DRY<span className="text-brand">X</span>
                    </>
                  ) : (
                    b
                  )}
                </span>
                <span className="text-brand" aria-hidden>
                  ✕
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
