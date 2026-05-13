import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MerchantDetail } from './MerchantDetail';
import { ArrowLeft, Building2 } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';

export const MerchantDetailPage: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();

  const handleBack = () => navigate('/admin/merchants');

  if (!merchantId) {
    return (
      <PageTransition className="space-y-6">
        <motion.button
          onClick={handleBack}
          className="inline-flex items-center gap-2 font-sans text-text-sm font-medium text-gray-500 hover:text-gp-cobalt transition-colors duration-150"
          whileHover={{ x: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <ArrowLeft size={15} />
          Back to Merchants
        </motion.button>
        <div className="rounded-2xl bg-white border-gradient shadow-sm p-12 text-center">
          <div className="flex justify-center mb-5">
            <div className="p-4 bg-danger-light rounded-2xl">
              <Building2 className="w-10 h-10 text-danger-fg" />
            </div>
          </div>
          <h3 className="font-display font-semibold text-display-xs text-gray-900 mb-2">
            Invalid Merchant
          </h3>
          <p className="font-sans text-text-sm text-gray-500">
            This merchant ID is not valid.
          </p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <motion.button
        onClick={handleBack}
        className="inline-flex items-center gap-2 font-sans text-text-sm font-medium text-gray-500 hover:text-gp-cobalt transition-colors duration-150"
        whileHover={{ x: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <ArrowLeft size={15} />
        Back to Merchants
      </motion.button>
      <MerchantDetail merchantId={merchantId} onBack={handleBack} />
    </PageTransition>
  );
};
