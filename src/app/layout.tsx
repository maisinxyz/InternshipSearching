import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jobs · Co-op Desk',
  description:
    'A personal workspace for your next engineering internship. Sample jobs for a visual preview.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
