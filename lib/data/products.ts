import type { Category, Product, Variant } from "@/lib/types"

/**
 * Catálogo semilla construido a partir de las publicaciones de @dryx.cr.
 * Precios tomados de los posts. Estimados para la demo: Set Jordan, suetas y polo Puma.
 */

const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"]
const CLOTH_SIZES = ["S", "M", "L", "XL"]

/** Genera variantes color × talla con stock pseudoaleatorio pero determinista. */
function variants(prefix: string, colors: string[], sizes: string[], seed = 7): Variant[] {
  const out: Variant[] = []
  let n = seed
  for (const color of colors) {
    for (const size of sizes) {
      n = (n * 9301 + 49297) % 233280
      const r = n / 233280
      const stock = r < 0.05 ? 0 : r < 0.18 ? 1 + Math.floor(r * 6) : 2 + Math.floor(r * 9)
      out.push({ id: `${prefix}-${color}-${size}`.toLowerCase().replace(/\s+/g, ""), color, size, stock })
    }
  }
  return out
}

type Seed = Omit<Product, "id" | "createdAt" | "featured" | "isDryx" | "tags"> &
  Partial<Pick<Product, "featured" | "isDryx" | "tags" | "createdAt">>

const img = (f: string) => `/ig/p/${f}`

const seeds: Seed[] = [
  // ───────── Sneakers ─────────
  {
    slug: "nike-air-force-1",
    sku: "NIK-AF1-07",
    name: "Nike Air Force 1 '07",
    brand: "Nike",
    category: "sneakers",
    description:
      "Un clásico icónico: robusto, cómodo y atemporal. Cuero full white, suela Air y la presencia que solo un AF1 tiene.",
    price: 84900,
    images: [img("af1-cv.jpg"), img("af1-detail.jpg")],
    imagePosition: "22% 55%",
    featured: true,
    tags: ["clásico", "blanco"],
    variants: variants("af1", ["Blanco"], SHOE_SIZES, 3),
  },
  {
    slug: "nike-court-vision-low",
    sku: "NIK-CV-LOW",
    name: "Nike Court Vision Low",
    brand: "Nike",
    category: "sneakers",
    description:
      "Diseño limpio, ligero y versátil inspirado en el básquet de los 80. Perfecto para el día a día con un look moderno.",
    price: 69900,
    images: [img("court-vision.jpg"), img("af1-cv.jpg")],
    imagePosition: "50% 48%",
    tags: ["blanco"],
    variants: variants("cvl", ["Blanco"], SHOE_SIZES, 11),
  },
  {
    slug: "nike-court-vision-mid",
    sku: "NIK-CV-MID",
    name: "Nike Court Vision Mid",
    brand: "Nike",
    category: "sneakers",
    description: "La versión de caña media del Court Vision. Soporte extra en el tobillo y el mismo estilo limpio.",
    price: 59900,
    images: [img("court-vision.jpg")],
    imagePosition: "50% 48%",
    tags: ["blanco"],
    variants: variants("cvm", ["Blanco"], SHOE_SIZES, 19),
  },
  {
    slug: "nike-dunk-low-panda",
    sku: "NIK-DUNK-PANDA",
    name: "Nike Dunk Low “Panda”",
    brand: "Nike",
    category: "sneakers",
    description:
      "Los clásicos que nunca fallan. Blanco y negro, comodidad total y el sneaker perfecto para clases y outfits streetwear.",
    price: 66900,
    images: [img("dunk-panda.jpg")],
    imagePosition: "50% 60%",
    featured: true,
    tags: ["blanco", "negro"],
    variants: variants("dunk", ["Blanco/Negro"], SHOE_SIZES, 23),
  },
  {
    slug: "nike-air-max-furyosa-sanddrift",
    sku: "NIK-FURYOSA",
    name: "Nike Air Max Furyosa “Sanddrift”",
    brand: "Nike",
    category: "sneakers",
    description:
      "Diseño moderno con amortiguación Air Max. Color Grey / Beige / Sail para elevar cualquier outfit urbano.",
    price: 69900,
    images: [img("furyosa.jpg")],
    imagePosition: "50% 35%",
    featured: true,
    tags: ["mujer", "air max"],
    variants: variants("fury", ["Grey/Beige"], ["36", "37", "38", "39", "40"], 31),
  },
  {
    slug: "nike-sb-negro",
    sku: "NIK-SB-BLK",
    name: "Nike SB Triple Black",
    brand: "Nike",
    category: "sneakers",
    description: "Gamuza negra total, suela de skate y agarre de sobra. Oferta especial hasta agotar existencias.",
    price: 29900,
    compareAtPrice: 49900,
    images: [img("nike-sb.jpg")],
    imagePosition: "50% 40%",
    featured: true,
    tags: ["oferta", "negro", "skate"],
    variants: variants("sb", ["Negro"], SHOE_SIZES, 37),
  },
  {
    slug: "puma-suede-classic",
    sku: "PUM-SUEDE",
    name: "Puma Suede Classic",
    brand: "Puma",
    category: "sneakers",
    description:
      "Un ícono del streetwear desde 1968. Material suede premium y suela clásica Puma resistente.",
    price: 47900,
    images: [img("puma-suede-rojo.jpg")],
    imagePosition: "50% 72%",
    tags: ["clásico", "rojo"],
    variants: variants("suede", ["Rojo", "Negro"], SHOE_SIZES, 41),
  },
  {
    slug: "puma-suede-xl",
    sku: "PUM-SUEDE-XL",
    name: "Puma Suede XL",
    brand: "Puma",
    category: "sneakers",
    description:
      "Cordones anchos y silueta inflada inspirada en la cultura skate de los 2000. Colores especiales rojo, azul y verde.",
    price: 55900,
    images: [img("puma-suede-xl.jpg")],
    imagePosition: "50% 45%",
    featured: true,
    tags: ["skate", "drop"],
    variants: variants("suedexl", ["Negro", "Rojo", "Azul", "Verde"], ["39", "40", "41", "42", "43", "44"], 43),
  },
  {
    slug: "new-balance-550",
    sku: "NB-550",
    name: "New Balance 550",
    brand: "New Balance",
    category: "sneakers",
    description:
      "La silueta legendaria del básquet retro. Cuero premium, perforaciones clásicas y versatilidad para cualquier outfit.",
    price: 54900,
    images: [img("nb-550.jpg"), img("nb-550-stack.jpg")],
    imagePosition: "50% 50%",
    featured: true,
    tags: ["retro", "drop"],
    variants: variants("nb550", ["Blanco/Negro", "Blanco/Rojo", "Blanco/Azul"], ["39", "40", "41", "42", "43", "44", "45"], 47),
  },
  {
    slug: "new-balance-574-legacy",
    sku: "NB-574-LEG",
    name: "New Balance 574 Legacy",
    brand: "New Balance",
    category: "sneakers",
    description: "Un clásico atemporal con detalles en rojo. Comodidad todo el día y diseño icónico.",
    price: 51900,
    images: [img("nb-574.jpg")],
    imagePosition: "60% 50%",
    tags: ["retro"],
    variants: variants("nb574", ["Blanco/Rojo"], SHOE_SIZES, 53),
  },
  {
    slug: "puma-incinerate",
    sku: "PUM-INCIN",
    name: "Puma Incinerate",
    brand: "Puma",
    category: "sneakers",
    description: "Ligeras y deportivas. Para entrenar, caminar o completar tu outfit DRYX.",
    price: 27900,
    images: [img("puma-incinerate.jpg")],
    imagePosition: "55% 50%",
    tags: ["running", "rojo"],
    variants: variants("incin", ["Rojo/Negro"], SHOE_SIZES, 59),
  },
  {
    slug: "hi-tec-outdoor",
    sku: "HTC-OUT-LOW",
    name: "Hi-Tec Outdoor Low",
    brand: "Hi-Tec",
    category: "sneakers",
    description:
      "Para aventura, brete pesado o explorar sin límites. Alta resistencia y comodidad para largas caminatas.",
    price: 44900,
    images: [img("hi-tec.jpg")],
    imagePosition: "50% 80%",
    tags: ["outdoor", "negro"],
    variants: variants("hitec", ["Negro"], ["39", "40", "41", "42", "43", "44"], 61),
  },

  // ───────── Ropa ─────────
  {
    slug: "camiseta-dryx-dry-cool",
    sku: "DRX-DRYCOOL",
    name: "Camiseta DRYX Dry Cool",
    brand: "DRYX",
    category: "ropa",
    description:
      "Diseño urbano, comodidad deportiva y calidad que habla sola. Tela Dry Cool que respira en la cancha y en la calle.",
    price: 14900,
    images: [img("dryx-drycool.jpg")],
    imagePosition: "50% 55%",
    featured: true,
    isDryx: true,
    tags: ["marca dryx", "3x₡35.000"],
    variants: variants("drycool", ["Verde salvia", "Negro", "Blanco"], CLOTH_SIZES, 67),
  },
  {
    slug: "camiseta-dryx-signature",
    sku: "DRX-SIGNATURE",
    name: "Camiseta DRYX Signature",
    brand: "DRYX",
    category: "ropa",
    description: "Logo DRYX en relieve tono sobre tono. Perfecta para calle, gym o salida.",
    price: 14900,
    images: [img("dryx-signature.jpg")],
    imagePosition: "50% 55%",
    isDryx: true,
    tags: ["marca dryx", "3x₡35.000"],
    variants: variants("signature", ["Blanco", "Negro"], CLOTH_SIZES, 71),
  },
  {
    slug: "conjunto-jordan-hoodie-jogger",
    sku: "JOR-SET-HJ",
    name: "Set Jordan Hoodie + Jogger",
    brand: "Jordan",
    category: "ropa",
    description: "Hoodie + jogger con detalles dorados. Corte moderno, ajuste cómodo y calidad original.",
    price: 64900,
    images: [img("jordan-set.jpg")],
    imagePosition: "60% 30%",
    featured: true,
    tags: ["conjunto", "negro"],
    variants: variants("jordan", ["Negro/Dorado"], CLOTH_SIZES, 73),
  },
  {
    slug: "sueta-lakers-new-era",
    sku: "NE-SUE-LAL",
    name: "Sueta Lakers",
    brand: "New Era",
    category: "ropa",
    description: "Hoodie gris jaspeado con logo Lakers. Para los que viven el deporte y la moda.",
    price: 32900,
    images: [img("sueta-lakers.jpg")],
    imagePosition: "50% 45%",
    tags: ["nba", "sueta"],
    variants: variants("lakers", ["Gris"], CLOTH_SIZES, 79),
  },
  {
    slug: "sueta-chicago-bulls",
    sku: "NE-SUE-CHI",
    name: "Sueta Chicago Bulls",
    brand: "New Era",
    category: "ropa",
    description: "Hoodie negro con letras BULLS bordadas. Estilo original Chicago.",
    price: 32900,
    images: [img("sueta-bulls.jpg")],
    imagePosition: "50% 45%",
    featured: true,
    tags: ["nba", "sueta"],
    variants: variants("bullsh", ["Negro"], CLOTH_SIZES, 83),
  },
  {
    slug: "sueta-boston-red-sox",
    sku: "NE-SUE-BOS",
    name: "Sueta Boston Red Sox",
    brand: "New Era",
    category: "ropa",
    description: "Hoodie navy con el clásico logo de los Red Sox.",
    price: 32900,
    images: [img("sueta-redsox.jpg")],
    imagePosition: "50% 45%",
    tags: ["mlb", "sueta"],
    variants: variants("redsox", ["Navy"], CLOTH_SIZES, 89),
  },
  {
    slug: "sueta-new-era-essential",
    sku: "NE-SUE-ESS",
    name: "Sueta New Era Essential",
    brand: "New Era",
    category: "ropa",
    description: "Hoodie negro con flag bordada en dorado. Básico premium.",
    price: 29900,
    images: [img("sueta-newera.jpg")],
    imagePosition: "50% 50%",
    tags: ["sueta", "negro"],
    variants: variants("neweras", ["Negro"], CLOTH_SIZES, 97),
  },
  {
    slug: "camisa-new-era-miami-heat",
    sku: "NE-TEE-MIA",
    name: "Camisa New Era Miami Heat",
    brand: "New Era",
    category: "ropa",
    description: "Camiseta blanca oversize con el logo de Miami Heat en la espalda. Producto original New Era.",
    price: 18900,
    images: [img("miami-heat.jpg")],
    imagePosition: "50% 50%",
    tags: ["nba"],
    variants: variants("heat", ["Blanco"], CLOTH_SIZES, 101),
  },
  {
    slug: "camisa-chicago-bulls",
    sku: "NE-TEE-CHI",
    name: "Camisa Chicago Bulls",
    brand: "New Era",
    category: "ropa",
    description: "Camisa roja con letras BULLS. Combinala con la gorra y llevate el combo por ₡43.000.",
    price: 24900,
    images: [img("bulls-set.jpg")],
    imagePosition: "50% 85%",
    tags: ["nba", "combo"],
    variants: variants("bullst", ["Rojo"], CLOTH_SIZES, 103),
  },
  {
    slug: "polo-puma-essentials",
    sku: "PUM-POLO-ESS",
    name: "Polo Puma Essentials",
    brand: "Puma",
    category: "ropa",
    description: "Elegancia y comodidad en una sola prenda. Piqué de algodón, disponible en varios colores.",
    price: 24900,
    images: [img("polo-puma.jpg")],
    imagePosition: "50% 50%",
    tags: ["polo"],
    variants: variants("polo", ["Gris", "Negro", "Blanco"], CLOTH_SIZES, 107),
  },

  // ───────── Gorras ─────────
  {
    slug: "gorra-chicago-bulls-negra",
    sku: "NE-940-CHI-BK",
    name: "Gorra Chicago Bulls 9FORTY",
    brand: "New Era",
    category: "gorras",
    description: "Negra con el toro bordado en alta calidad. Ajustable. Estilo original Chicago Bulls.",
    price: 22900,
    images: [img("bulls-set.jpg")],
    imagePosition: "50% 55%",
    featured: true,
    tags: ["nba", "combo"],
    variants: variants("capbulls", ["Negro"], ["Ajustable"], 109),
  },
  {
    slug: "gorra-chicago-bulls-beige",
    sku: "NE-940-CHI-BG",
    name: "Gorra Chicago Bulls Wave",
    brand: "New Era",
    category: "gorras",
    description: "Diseño bicolor beige y arena con el toro en relieve. Edición limitada.",
    price: 22900,
    images: [img("gorra-bulls-beige.jpg")],
    imagePosition: "50% 50%",
    tags: ["nba"],
    variants: variants("capbeige", ["Beige"], ["Ajustable"], 113),
  },
  {
    slug: "gorra-new-era-full-white",
    sku: "NE-CAP-WHT",
    name: "Gorra New Era Full White",
    brand: "New Era",
    category: "gorras",
    description: "Blanca total, limpia y combinable con todo. 100 % original New Era.",
    price: 22900,
    images: [img("miami-heat.jpg")],
    imagePosition: "55% 12%",
    tags: ["blanco"],
    variants: variants("capwhite", ["Blanco"], ["Ajustable"], 127),
  },

  // ───────── Accesorios ─────────
  {
    slug: "botella-termica-lda",
    sku: "DRX-TERMO-LDA",
    name: "Botella térmica Alajuelense",
    brand: "DRYX",
    category: "accesorios",
    description:
      "Mantiene frío y caliente. Acero inoxidable FREE BPA, perfecta para gym, brete o el día a día. Desde 12 oz hasta 26 oz.",
    price: 12900,
    images: [img("botella-lda.jpg")],
    imagePosition: "50% 55%",
    tags: ["termo"],
    variants: variants("lda", ["Negro"], ["12 oz", "20 oz", "26 oz"], 131),
  },
]

export const seedProducts: Product[] = seeds.map((s, i) => ({
  featured: false,
  isDryx: false,
  tags: [],
  createdAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
  ...s,
  id: `p${String(i + 1).padStart(3, "0")}`,
}))

export const CATEGORIES: { id: Category; label: string; blurb: string; image: string; position: string }[] = [
  { id: "sneakers", label: "Sneakers", blurb: "Nike, Puma, New Balance y más", image: img("nb-550-stack.jpg"), position: "50% 55%" },
  { id: "ropa", label: "Ropa", blurb: "Camisetas, suetas y conjuntos", image: img("sueta-bulls.jpg"), position: "50% 40%" },
  { id: "gorras", label: "Gorras", blurb: "New Era · NBA · MLB", image: img("gorra-bulls-beige.jpg"), position: "50% 45%" },
  { id: "accesorios", label: "Accesorios", blurb: "Termos y botellas", image: img("botella-lda.jpg"), position: "50% 50%" },
]

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.label ?? c
