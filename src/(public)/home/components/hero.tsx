import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12 md:py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-4 leading-tight">
          Your Premium
          <span className="text-blue block">Solution</span>
        </h1>
        <p className="text-lg text-gray-mid max-w-2xl mx-auto mb-8">
          Experience the quiet elegance of modern design. Built for performance, crafted for perfection.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-blue hover:bg-blue-dark text-white font-semibold px-6 py-3">
            Get Started
          </Button>
          <Button variant="outline" className="border-charcoal text-charcoal hover:bg-charcoal hover:text-white px-6 py-3">
            Learn More
          </Button>
        </div>
      </div>
    </motion.section>
  );
}