import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { blogPosts } from "@/data/blog-posts";
import BlogCard from "@/components/BlogCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const blog = dict.blog as Record<string, string>;

  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    alternates: {
      canonical: `/${lang}/blog`,
      languages: { es: "/es/blog", en: "/en/blog", "x-default": "/es/blog" },
    },
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      type: "website",
      locale: lang === "es" ? "es_MX" : "en_US",
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const blog = dict.blog as Record<string, string>;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-lagoon-bg/50 to-sand pt-16 pb-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-sea text-xs font-bold tracking-widest uppercase font-body mb-3">
            {blog.sectionLabel}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-ink mb-4 max-w-2xl">
            {blog.pageTitle}
          </h1>
          <p className="text-ink-soft text-lg max-w-xl font-body leading-relaxed">
            {blog.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                lang={lang}
                readMoreLabel={blog.readMore}
                minReadLabel={blog.minRead}
              />
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD Blog structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog RivieraMayaPass",
            description: blog.metaDescription,
            url: `https://rivieramayapass.com/${lang}/blog`,
            publisher: {
              "@type": "Organization",
              name: "RivieraMayaPass",
              url: "https://rivieramayapass.com",
            },
            blogPost: blogPosts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              url: `https://rivieramayapass.com/${lang}/blog/${post.slug}`,
              datePublished: post.publishedAt,
              image: post.coverImage,
            })),
          }),
        }}
      />
    </>
  );
}
