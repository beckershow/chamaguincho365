"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface RoadmapItem {
  quarter: string;
  title: string;
  description: string;
  status?: "done" | "in-progress" | "upcoming";
  icon?: LucideIcon;
}

export interface RoadmapCardProps {
  title?: string;
  description?: string;
  items: RoadmapItem[];
  className?: string;
}

export function RoadmapCard({
  title = "Product Roadmap",
  description = "Upcoming features and releases",
  items,
  className,
}: RoadmapCardProps) {
  return (
    <Card className={cn("w-full bg-card border-border", className)}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm md:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-[14px] md:left-[18px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

          <div className="space-y-4 md:space-y-6">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex gap-3 md:gap-4 items-start group"
                >
                  {/* Timeline Dot with Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={cn(
                        "w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                        item.status === "done"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : item.status === "in-progress"
                          ? "bg-primary/80 text-primary-foreground animate-pulse"
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {Icon ? (
                        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      ) : (
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-current" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1 md:pb-2 min-w-0">
                    <h4 className="font-semibold text-foreground mb-0.5 md:mb-1 group-hover:text-primary transition-colors text-sm md:text-base">
                      {item.title}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
