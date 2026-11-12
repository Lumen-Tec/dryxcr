import type { LandingContent } from "@/lib/types"

export const REEL_SLOTS = 4
export const FEATURED_LIMIT = 8

export const seedLanding: LandingContent = {
  hero: { src: "/ig/v/hero.mp4", poster: "/ig/p/tienda-tour.jpg" },
  reels: [
    { src: "/ig/v/reel-1.mp4", poster: "/ig/p/reel-1.jpg", caption: "Te esperamos con los brazos abiertos" },
    { src: "/ig/v/puma-suede-xl.mp4", poster: "/ig/p/puma-suede-xl.jpg", caption: "Puma Suede XL" },
    { src: "/ig/v/dryx-drycool.mp4", poster: "/ig/p/dryx-drycool.jpg", caption: "DRYX Dry Cool" },
    { src: "/ig/v/nb-550.mp4", poster: "/ig/p/nb-550.jpg", caption: "Nuevo drop NB 550" },
  ],
  brands: ["Nike", "Puma", "New Balance", "Jordan", "New Era", "Hi-Tec", "DRYX"],
  featuredOrder: [],
}
