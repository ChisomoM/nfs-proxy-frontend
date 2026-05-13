import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterCard?: string;
  canonical?: string;
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Default Title',
  description = 'Default description',
  keywords = '',
  image = '',
  url = window.location.href,
  type = 'website',
  siteName = 'Your Site Name',
  twitterCard = 'summary_large_image',
  canonical,
  children,
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {canonical && <link rel="canonical" href={canonical} />}
      {children}
    </Helmet>
  );
};

export default SEO;