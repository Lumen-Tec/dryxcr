import { BrandMarquee } from "@/components/landing/brand-marquee"
import { BrandStory } from "@/components/landing/brand-story"
import { Categories } from "@/components/landing/categories"
import { Featured } from "@/components/landing/featured"
import { Hero } from "@/components/landing/hero"
import { Location } from "@/components/landing/location"
import { PromoBanner } from "@/components/landing/promo-banner"
import { Reels } from "@/components/landing/reels"

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <Featured />
      <Categories />
      <PromoBanner />
      <BrandStory />
      <Reels />
      <Location />
    </>
  )
}
