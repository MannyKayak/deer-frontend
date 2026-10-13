import Image from "next/image";
import { CategoryTag } from "@/components/ui/category-tag";
import { ButtonPrimary } from "@/components/ui/button-primary";
import type { HomeContent } from "@/lib/data/types";

const IMAGE_SIZES = "(min-width: 1024px) 540px, (min-width: 640px) 320px, 250px";

/**
 * Two columns from `lg`: copy on the left, mascot on the right. Below `lg` it
 * stacks and the mascot moves above the headline (`order-first`), while the
 * copy stays first in the DOM.
 *
 * `content` comes from the backoffice through `getHomeContent` and is always
 * complete. Only the tag and the CTA target are fixed here.
 */
export function Hero({ content }: { content: HomeContent }) {
  const { title, subtitle, cta, stats, image } = content;

  return (
    <section className="px-[22px] py-[36px] lg:py-[64px] xl:px-[56px] xl:py-[80px]">
      <div className="mx-auto grid max-w-page items-center gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-x-[56px]">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <CategoryTag>Concorso pubblico farmacie</CategoryTag>

          <h1 className="max-w-2xl font-fredoka text-[30px] font-bold leading-[1.15] text-text-primary xl:text-[52px] xl:leading-[1.12]">
            {title}
          </h1>

          <p className="max-w-xl font-sans text-[15px] leading-[1.5] text-text-secondary xl:text-lg">{subtitle}</p>

          <div className="flex flex-col items-center gap-2 lg:items-start">
            <ButtonPrimary href="/quiz" arrow>
              {cta.label}
            </ButtonPrimary>
            <span className="font-sans text-[13px] font-medium text-text-secondary">{cta.note}</span>
          </div>

          {stats.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-x-[28px] gap-y-3 pt-4 lg:justify-start">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center lg:items-start">
                  <span className="font-fredoka text-[20px] font-bold text-primary-dark xl:text-[26px]">
                    {stat.value}
                  </span>
                  <span className="font-sans text-[12.5px] font-medium text-text-secondary">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative order-first mx-auto w-full max-w-[250px] sm:max-w-[320px] lg:order-none lg:max-w-[540px]">
          <div aria-hidden="true" className="absolute inset-x-[4%] bottom-[3%] aspect-square rounded-full bg-qtag-bg" />
          {image.remote ? (
            // Unknown dimensions: the square box reserves the space, so nothing shifts when the image loads.
            <div className="relative aspect-square w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={IMAGE_SIZES}
                loading="eager"
                fetchPriority="high"
                className="object-contain"
              />
            </div>
          ) : (
            <Image
              src={image.src}
              alt={image.alt}
              width={1213}
              height={1217}
              sizes={IMAGE_SIZES}
              loading="eager"
              fetchPriority="high"
              className="relative h-auto w-full"
            />
          )}
        </div>
      </div>
    </section>
  );
}
