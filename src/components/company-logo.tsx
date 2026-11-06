export function CompanyLogo({ name, logo, size = 'md' }: { name: string; logo: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'size-9 rounded-lg', md: 'size-12 rounded-xl', lg: 'size-16 rounded-2xl' }[size];
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`${box} flex shrink-0 items-center justify-center border border-line bg-white`}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="size-3/5 object-contain" />
      ) : (
        <span aria-hidden className="font-display text-sm font-bold text-muted">{initials}</span>
      )}
    </div>
  );
}
