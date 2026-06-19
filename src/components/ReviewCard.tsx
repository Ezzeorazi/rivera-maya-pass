import type { Review } from '@/data/reviews';
import type { Locale } from '@/i18n/config';
import { getLocalizedField } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  lang: Locale;
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-sun"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function ReviewCard({ review, lang }: ReviewCardProps) {
  const text = getLocalizedField(review, 'text', lang);
  const city = getLocalizedField(review, 'city', lang);

  return (
    <div className="bg-shell rounded-2xl border border-line p-6 flex flex-col gap-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: review.rating }, (_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      <blockquote className="text-ink italic font-body leading-relaxed flex-1">
        &ldquo;{text}&rdquo;
      </blockquote>

      <div>
        <p className="font-display font-semibold text-ink">{review.name}</p>
        <p className="text-sm text-ink-soft font-body">{city}</p>
      </div>
    </div>
  );
}
