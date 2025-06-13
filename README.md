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

The project is configured for automatic deployments on [Vercel](https://vercel.com/).
Every push to the `main` branch updates production, while pushes to other
branches create **Preview Deployments**.

1. Create a feature branch and commit your changes:

   ```bash
   git checkout -b my-feature
   # edit files then
   git add .
   git commit -m "Test: update feature"
   git push origin my-feature
   ```

2. Vercel automatically builds the branch and provides a preview URL. You can
   find the link in the Pull Request, the Vercel dashboard or via the
   `vercel` CLI.

3. (Optional) test locally using the Vercel CLI:

   ```bash
   vercel --prebuilt
   ```

If your local project is not linked to Vercel yet, run `vercel link` once.

## License

[MIT](LICENSE)
