import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="Pursuit" width={32} height={32} />
          <span className="text-base font-semibold tracking-[-0.01em] text-slate-900">Pursuit</span>
        </Link>
      </header>
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 pb-12 pt-4 sm:pt-0">
        {children}
      </main>
    </div>
  );
}
