// dynamic-image.tsx
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface DynamicImageProps {
  url: string;
  alt: string;
  containerClass?: string;
}

const DynamicImage: React.FC<DynamicImageProps> = ({ url, alt, containerClass }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (url) {
      const loadImage = async () => {
        try {
          // Simulating image loading, replace this with actual image processing if needed
          setImageSrc(url);
          setHasError(false);
        } catch (error) {
          console.error('Error loading image:', error);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      };
      loadImage();
    }
  }, [url]);

  if (isLoading) {
    return <p>Loading image...</p>; // You can replace this with a loading spinner if desired
  }

  if (hasError) {
    return <p>Error loading image.</p>;
  }

  return (
    <div className={containerClass}>
      <Image
        src={imageSrc || ''}
        alt={alt}
        layout="fill" // Or use layout="responsive" for responsive images
        objectFit="cover" // Adjust objectFit as needed
      />
    </div>
  );
};

export default DynamicImage;
