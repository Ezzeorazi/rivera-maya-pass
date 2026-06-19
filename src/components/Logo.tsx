import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  lang: string;
  variant?: 'default' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ lang, size = 'md' }: LogoProps) {
  const heights: Record<string, number> = { sm: 32, md: 40, lg: 56 };
  const h = heights[size];

  return (
    <Link href={`/${lang}`} className="inline-flex items-center shrink-0">
      <Image
        src="/imagotipo.svg"
        alt="RivieraMayaPass"
        width={h}
        height={h}
        className="w-auto"
        style={{ height: h }}
        unoptimized
        priority
      />
    </Link>
  );
}
