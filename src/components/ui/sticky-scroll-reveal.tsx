"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    leftContent?: React.ReactNode | any;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    target: ref,
    // container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  // Matching the hero gradient style
  const backgroundColors = [
    "linear-gradient(to bottom right, #fff7ed, #ffffff, #eff6ff)", // from-orange-50 via-white to-blue-50
    "linear-gradient(to bottom right, #fff7ed, #ffffff, #eff6ff)",
    "linear-gradient(to bottom right, #fff7ed, #ffffff, #eff6ff)",
  ];
  const linearGradients = [
    "linear-gradient(to bottom right, #f97316, #fb923c)", // orange gradient
    "linear-gradient(to bottom right, #3b82f6, #60a5fa)", // blue gradient  
    "linear-gradient(to bottom right, #a855f7, #c084fc)", // purple gradient
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0],
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        background: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative w-full"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT SIDE - Scrolling Content */}
          <div className="relative">
            {content.map((item, index) => (
              <div key={item.title + index} className="min-h-screen flex items-center py-10">
                {item.leftContent ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: activeCard === index ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.leftContent}
                  </motion.div>
                ) : (
                  <>
                    <motion.h2
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: activeCard === index ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-2xl font-bold text-gray-900"
                    >
                      {item.title}
                    </motion.h2>
                    <motion.p
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: activeCard === index ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-lg mt-10 max-w-sm text-gray-600"
                    >
                      {item.description}
                    </motion.p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - Sticky Content */}
          <div className="relative hidden lg:block">
            <div className="sticky top-20 h-screen flex items-center pt-12">
              <motion.div
                key={activeCard}
                initial={{ filter: "blur(4px)", scale: 0.95 }}
                animate={{ filter: "blur(0px)", scale: 1 }}
                exit={{ filter: "blur(4px)", scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ background: backgroundGradient }}
                className={cn(
                  "h-[420px]  w-full overflow-hidden rounded-2xl shadow-2xl",
                  contentClassName,
                )}
              >
                {content[activeCard].content ?? null}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
