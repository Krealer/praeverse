import '../style/globals.css'; // ✅ Correct relative path to your CSS

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Praeverse',
  description: 'The story begins before the first word.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
