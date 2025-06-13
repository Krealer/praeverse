# Praeverse

**Praeverse** is a psychological 2D grid-based game built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/) magic link authentication, TypeScript and pure CSS. There are no external art assets – every tile and UI element is rendered with CSS.

## Features

- **Mobile-friendly grid** playable on touch screens
- **Tap or click movement** to adjacent tiles
- **Interactive NPCs** that display dialogue
- **Walls, ground and door tiles** for basic navigation
- **Doors** that transition between modular maps
- **Supabase login** using email magic links

## Folder Structure

- `src/maps` – map definitions
- `src/app` – UI components and game logic
- `src/lib/supabase.ts` – Supabase client configuration
- `public/favicon.svg` – site icon

## How to Run Locally

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Supabase keys:
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Then open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

Push your changes to trigger an automatic deployment on [Vercel](https://vercel.com/).

## License

[MIT](LICENSE)
