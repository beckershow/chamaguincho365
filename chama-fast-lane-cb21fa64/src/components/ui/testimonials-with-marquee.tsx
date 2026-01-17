import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-background text-foreground",
      "py-12 md:py-16 lg:py-24 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 text-center">
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-4">
          <h2 className="max-w-[720px] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight font-bold">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-[600px] font-medium text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:0.75rem] sm:[--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(4)].map((_, setIndex) => 
                testimonials.map((testimonial, i) => (
                  <TestimonialCard key={`${setIndex}-${i}`} {...testimonial} />
                ))
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden sm:block w-1/4 md:w-1/3 bg-gradient-to-r from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden sm:block w-1/4 md:w-1/3 bg-gradient-to-l from-background" />
        </div>
      </div>
    </section>
  );
}
