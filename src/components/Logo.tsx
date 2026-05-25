import React from 'react';

type Variant = 'dark' | 'white';

export default function Logo({
  variant = 'dark',
  className = '',
  alt = 'GeePay',
}: {
  variant?: Variant;
  className?: string;
  alt?: string;
}) {
  const src = variant === 'white' ? '/logos/geepay-white.png' : '/logos/geepay_dark.png';

  return <img src={src} alt={alt} className={className} />;
}
