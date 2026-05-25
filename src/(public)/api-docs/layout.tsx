import { Metadata } from 'next';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'API Documentation | GeePay NFS',
  description: 'Interactive API documentation for the NFS Proxy REST API',
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}
