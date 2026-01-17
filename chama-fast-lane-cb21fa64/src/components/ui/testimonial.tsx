import * as React from "react"
import { motion, PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number | string
  name: string
  avatar: string
  description: string
}

interface TestimonialCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Testimonial[]
  showArrows?: boolean
  showDots?: boolean
}

const TestimonialCarousel = React.forwardRef<
  HTMLDivElement,
  TestimonialCarouselProps
>(
  (
    { className, testimonials, showArrows = true, showDots = true, ...props },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [exitX, setExitX] = React.useState(0)

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (Math.abs(info.offset.x) > 100) {
        setExitX(info.offset.x)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % testimonials.length)
          setExitX(0)
        }, 200)
      }
    }

    const handlePrev = () => {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    return (
      <div
        ref={ref}
        className={cn("relative w-full py-8", className)}
        {...props}
      >
        <div className="relative h-[320px] flex items-center justify-center">
          {testimonials.map((testimonial, index) => {
            const isCurrentCard = index === currentIndex
            const isPrevCard =
              index === (currentIndex + 1) % testimonials.length
            const isNextCard =
              index === (currentIndex + 2) % testimonials.length

            if (!isCurrentCard && !isPrevCard && !isNextCard) return null

            return (
              <motion.div
                key={testimonial.id}
                className={cn(
                  "absolute w-full max-w-md cursor-grab active:cursor-grabbing",
                  isCurrentCard && "z-30",
                  isPrevCard && "z-20",
                  isNextCard && "z-10"
                )}
                initial={false}
                animate={{
                  scale: isCurrentCard ? 1 : isPrevCard ? 0.95 : 0.9,
                  y: isCurrentCard ? 0 : isPrevCard ? 10 : 20,
                  opacity: isCurrentCard ? 1 : isPrevCard ? 0.7 : 0.5,
                  x: exitX,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={isCurrentCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
              >
                {showArrows && isCurrentCard && (
                  <div className="absolute -left-4 -right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-40">
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors pointer-events-auto"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors pointer-events-auto"
                    >
                      →
                    </button>
                  </div>
                )}

                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-primary"
                  />
                  <h3 className="text-lg font-semibold text-center text-foreground mb-2">
                    {testimonial.name}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    "{testimonial.description}"
                  </p>
                </div>
              </motion.div>
            )
          })}
          
          {showDots && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
)
TestimonialCarousel.displayName = "TestimonialCarousel"

export { TestimonialCarousel, type Testimonial }
