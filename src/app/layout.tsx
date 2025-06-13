import '../style/globals.css';
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
