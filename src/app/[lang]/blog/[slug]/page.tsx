import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { blogPosts } from "@/data/blog-posts";
import MarkdownContent from "@/components/MarkdownContent";
import { WHATSAPP_PHONE } from "@/lib/site";

export async function generateStaticParams() {
  return locales.flatMap((lang) =>
    blogPosts.map((post) => ({ lang, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | RivieraMayaPass`,
    description: post.excerpt,
    keywords: post.keywords.join(", "),
    alternates: {
      languages: {
        es: `/es/blog/${slug}`,
        en: `/en/blog/${slug}`,
      },
      canonical: `/${lang}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      locale: lang === "es" ? "es_MX" : "en_US",
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const dict = await getDictionary(lang as Locale);
  const blog = dict.blog as Record<string, string>;

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    lang === "es" ? "es-MX" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8">
        <Link
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-2 text-sea text-sm font-semibold font-body hover:gap-3 transition-all"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          {blog.backToBlog}
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        {/* Article Header */}
        <header className="pt-8 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="bg-sea/10 text-sea text-xs font-bold px-3 py-1.5 rounded-full font-body">
              {post.category}
            </span>
            <time
              dateTime={post.publishedAt}
              className="text-ink-soft/60 text-xs font-body"
            >
              {formattedDate}
            </time>
            <span className="text-ink-soft/30 text-xs" aria-hidden>
              ·
            </span>
            <span className="text-ink-soft/60 text-xs font-body">
              {post.readTime} {blog.minRead}
            </span>
          </div>

          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-ink leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-ink-soft text-lg leading-relaxed font-body border-l-4 border-sea pl-5 py-1">
            {post.excerpt}
          </p>
        </header>

        {/* Cover Image */}
        <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-10">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Markdown Content */}
        <div className="font-body text-base">
          <MarkdownContent content={post.content} />
        </div>

        {/* Keywords / Tags */}
        <div className="mt-12 pt-8 border-t border-line">
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword) => (
              <span
                key={keyword}
                className="bg-lagoon-bg/60 text-sea text-xs px-3 py-1.5 rounded-full font-body border border-sea/10"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Box */}
        <div className="mt-10 bg-gradient-to-br from-sea/10 via-lagoon-bg/20 to-lagoon-bg/40 rounded-2xl p-8 text-center border border-sea/10">
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">
            {blog.ctaTitle}
          </h2>
          <p className="text-ink-soft mb-6 font-body">{blog.ctaSubtitle}</p>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%2C%20quiero%20reservar%20un%20day%20pass%20en%20Playa%20del%20Carmen`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-coral text-white font-body font-bold px-8 py-4 rounded-xl hover:bg-coral/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-coral/25"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {blog.ctaButton}
          </a>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-lagoon-bg/20 py-14 border-t border-line">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-ink mb-8">
              Más artículos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${lang}/blog/${related.slug}`}
                  className="group flex gap-4 bg-sand rounded-2xl p-4 border border-line hover:border-sea/30 hover:shadow-md transition-all"
                >
                  <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                    <Image
                      src={related.coverImage}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sea text-xs font-bold font-body">
                      {related.category}
                    </span>
                    <h3 className="font-display font-semibold text-ink text-sm leading-snug mt-1 line-clamp-2 group-hover:text-sea transition-colors">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JSON-LD BlogPosting structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            keywords: post.keywords.join(", "),
            author: {
              "@type": "Organization",
              name: "RivieraMayaPass",
              url: "https://rivieramayapass.com",
            },
            publisher: {
              "@type": "Organization",
              name: "RivieraMayaPass",
              logo: {
                "@type": "ImageObject",
                url: "https://rivieramayapass.com/logotipo.webp",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://rivieramayapass.com/${lang}/blog/${post.slug}`,
            },
          }),
        }}
      />
    </>
  );
}
