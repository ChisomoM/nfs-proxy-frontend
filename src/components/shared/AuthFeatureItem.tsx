import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface AuthFeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const AuthFeatureItem: React.FC<AuthFeatureItemProps> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md transition-shadow hover:shadow-2xl"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="font-display font-semibold text-white text-base tracking-wide">{title}</h3>
      <p className="font-sans text-sm text-white/50 leading-snug">{description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-white/20 ml-auto self-center flex-shrink-0" />
  </motion.div>
);
