import type { Review } from '@/data/reviews';
import type { Locale } from '@/i18n/config';
import ReviewCard from './ReviewCard';

interface ReviewSectionProps {
  reviews: Review[];
  lang: Locale;
  dict: Record<string, unknown>;
}

export default function ReviewSection({ reviews, lang, dict }: ReviewSectionProps) {
  const reviewsDict = dict.reviews as Record<string, string>;

  return (
    <section className="py-16 lg:py-24 bg-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block uppercase tracking-widest text-coral text-xs font-bold font-body mb-2">
            {reviewsDict.sectionLabel}
          </span>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mb-3">
            {reviewsDict.title}
          </h2>
          <p className="text-ink-soft font-body max-w-lg mx-auto">
            {reviewsDict.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
