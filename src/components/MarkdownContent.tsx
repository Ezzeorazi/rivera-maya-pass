"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-display text-2xl font-semibold text-ink mt-10 mb-4 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display text-xl font-semibold text-ink mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-display text-lg font-semibold text-ink mt-6 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-ink-soft leading-relaxed mb-4 font-body">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 mb-6 text-ink-soft font-body">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-6 text-ink-soft font-body">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-ink-soft leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-sea pl-5 py-3 pr-4 my-6 bg-lagoon-bg/30 rounded-r-xl italic text-ink-soft font-body">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-ink-soft/80">{children}</em>,
  hr: () => <hr className="border-line my-8" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-sea underline underline-offset-2 hover:text-sea/70 transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="bg-lagoon-bg px-1.5 py-0.5 rounded text-sm font-mono text-sea">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-line">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-lagoon-bg/60">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-line last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-ink text-xs uppercase tracking-wide font-body">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-ink-soft font-body">{children}</td>
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
