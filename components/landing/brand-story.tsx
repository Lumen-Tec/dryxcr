import Image from "next/image"

const STATS = [
  { value: "100 %", label: "Marca nacional" },
  { value: "Originales", label: "Nike, Puma, NB, New Era" },
  { value: "7", label: "Provincias con envío" },
]

export function BrandStory() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <Image
          src="/ig/p/tienda-caja.jpg"
          alt="Caja de la tienda DRYX con el letrero DRYX no es estilo, es mentalidad"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: "60% 40%" }}
        />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Hecha en Costa Rica</p>
        <h2 className="font-display text-5xl text-balance sm:text-7xl">
          DRYX no es estilo.
          <br />
          Es mentalidad.
        </h2>
        <p className="mt-6 max-w-lg text-pretty text-muted-foreground">
          Una marca 100 % nacional, creada con inspiración y cariño para cada uno de ustedes. Además trajimos las
          marcas más reconocidas del mundo para que tengás más opciones para elegir. Siempre vamos a ser tu mejor
          opción.
        </p>
        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-3xl sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
