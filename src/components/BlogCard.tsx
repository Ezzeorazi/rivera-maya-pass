import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blog-posts";

interface BlogCardProps {
  post: BlogPost;
  lang: string;
  readMoreLabel?: string;
  minReadLabel?: string;
}

export default function BlogCard({
  post,
  lang,
  readMoreLabel = "Leer artículo",
  minReadLabel = "min de lectura",
}: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="bg-sand rounded-2xl overflow-hidden border border-line hover:shadow-xl hover:shadow-ink/5 transition-all duration-300 hover:-translate-y-1 group flex flex-col">
      <Link href={`/${lang}/blog/${post.slug}`} className="block">
        {/* Cover Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 bg-sea text-white text-xs font-bold px-3 py-1 rounded-full font-body">
            {post.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-ink-soft/60 mb-3 font-body">
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span aria-hidden>·</span>
          <span>
            {post.readTime} {minReadLabel}
          </span>
        </div>

        <Link href={`/${lang}/blog/${post.slug}`}>
          <h3 className="font-display font-semibold text-ink text-lg leading-snug mb-3 group-hover:text-sea transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-ink-soft text-sm leading-relaxed font-body line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <Link
          href={`/${lang}/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 mt-5 text-sea text-sm font-semibold font-body hover:gap-3 transition-all"
          aria-label={`Leer: ${post.title}`}
        >
          {readMoreLabel}
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
    </article>
  );
}
