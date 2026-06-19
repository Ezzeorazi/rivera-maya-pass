import SearchBar from './SearchBar';

export default function Hero({ dict }: { dict: Record<string, unknown> }) {
  const hero = dict.hero as Record<string, string>;

  return (
    <section className="relative overflow-hidden bg-sand">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-lagoon-bg/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-sun-bg/40 blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-sun/10 blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <span className="inline-block uppercase tracking-widest text-sea font-semibold text-xs font-body mb-6">
            {hero.eyebrow}
          </span>

          <h1 className="font-display font-semibold text-5xl lg:text-7xl leading-[1.05] tracking-tight text-ink max-w-4xl mb-4">
            {hero.title}{' '}
            <span className="italic font-normal text-coral">{hero.titleAccent}</span>
          </h1>

          <p className="text-ink-soft text-lg lg:text-xl max-w-xl mb-10 font-body leading-relaxed">
            {hero.subtitle}
          </p>

          <div className="w-full flex justify-center">
            <SearchBar dict={dict} />
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 30C360 60 720 0 1080 30C1260 45 1380 55 1440 50V60H0V30Z"
            className="fill-lagoon-bg"
            opacity="0.6"
          />
        </svg>
      </div>
    </section>
  );
}
