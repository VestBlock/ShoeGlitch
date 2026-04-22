import Image from 'next/image';
import { Card } from '@/components/ui';

interface OrderPhotoGalleryProps {
  title: string;
  eyebrow?: string;
  photos: string[];
  emptyLabel: string;
}

export function OrderPhotoGallery({
  title,
  eyebrow,
  photos,
  emptyLabel,
}: OrderPhotoGalleryProps) {
  return (
    <Card>
      {eyebrow ? <div className="font-mono text-xs text-ink/40 mb-1">{eyebrow}</div> : null}
      <h3 className="h-display text-2xl mb-4">
        {title} <span className="text-ink/35">({photos.length})</span>
      </h3>

      {photos.length === 0 ? (
        <p className="text-sm text-ink/55">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-bone-soft"
            >
              {/* These are stored customer/staff uploads served directly from storage. */}
              <Image
                src={url}
                alt={`${title} ${index + 1}`}
                width={720}
                height={720}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 768px) 33vw, 50vw"
              />
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
