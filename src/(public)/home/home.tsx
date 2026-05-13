// "use client";
import Hero from '@/(public)/home/components/hero';
import Navbar from '../../components/navbar';
import { Footer } from '@/components/footer';
import SEO from '../../components/SEO';
import { motion } from 'framer-motion';

const features = [
  { title: 'Feature One', description: 'Description of feature one.' },
  { title: 'Feature Two', description: 'Description of feature two.' },
  { title: 'Feature Three', description: 'Description of feature three.' },
];

export default function Home(){
    return(
        <div className="pt-20">
            <SEO
                title="Home - Premium Template"
                description="Experience our premium solution with modern design and innovative features."
                keywords="premium, template, modern, design"
                type="website"
            />
            <Navbar/>
            <Hero/>

            {/* Features Section */}
            <section className="py-12 md:py-20 bg-cream">
              <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
                <h2 className="text-3xl md:text-4xl font-bold text-charcoal text-center mb-12">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {features.map((feature, idx) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white p-6 rounded-lg shadow-sm"
                    >
                      <h3 className="font-semibold text-lg text-charcoal mb-2">{feature.title}</h3>
                      <p className="text-gray-mid">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <Footer/>
        </div>


    )
}