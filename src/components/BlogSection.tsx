import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";
import BlogCard from "./BlogCard";

interface BlogSectionProps {
  lang: string;
  dict: Record<string, unknown>;
}

export default function BlogSection({ lang, dict }: BlogSectionProps) {
  const blog = dict.blog as Record<string, string>;

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-sea text-xs font-bold tracking-widest uppercase font-body mb-2">
            {blog.sectionLabel}
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink">
            {blog.title}
          </h2>
          <p className="text-ink-soft mt-2 max-w-lg font-body leading-relaxed">
            {blog.subtitle}
          </p>
        </div>

        <Link
          href={`/${lang}/blog`}
          className="hidden md:inline-flex items-center gap-2 text-sea text-sm font-semibold hover:gap-3 transition-all font-body whitespace-nowrap"
        >
          {blog.seeAll}
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Mobile CTA */}
      <div className="mt-8 text-center md:hidden">
        <Link
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-2 bg-sea/10 text-sea font-semibold px-6 py-3 rounded-xl hover:bg-sea/20 transition-colors font-body"
        >
          {blog.seeAll}
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
