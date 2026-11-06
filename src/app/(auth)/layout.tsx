import { Wordmark } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Wordmark />
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</main>
      </div>
      <div className="relative hidden overflow-hidden bg-brand lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="font-display text-4xl font-extrabold leading-tight">Every new internship,<br />straight from the source.</p>
          <p className="mt-3 max-w-md text-white/80">Search, save, set alerts and track every application in one place.</p>
        </div>
      </div>
    </div>
  );
}
