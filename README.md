# Mahjong Solitaire

A free, offline-friendly tile-match PWA — tray matching, level path, themes, no ads.

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) only  
  (Node/npm are **not** installed on the host)

## Develop

```bash
docker compose up --build
```

Open [http://localhost:5174](http://localhost:5174).

Handy Make targets (all wrap Docker):

| Command        | What it does                          |
|----------------|---------------------------------------|
| `make up`      | Dev server with hot reload            |
| `make test`    | Run Vitest                            |
| `make build`   | Production build into `dist/`         |
| `make shell`   | Shell inside the app container        |

## Deploy (GitHub Pages)

Pushes to `main` build and publish via GitHub Actions.

- **Live URL:** https://hiveuprss.github.io/mahjong/
- **Build:** `vite build --base /mahjong/`
- **Workflow:** `.github/workflows/deploy-pages.yml`

Local/Docker builds still use `/`.

## Play

- Tap free tiles into a 4-slot tray; matching pairs shatter  
- **40 levels** with progressive unlock  
- Tile themes: Classic, Orchard, Fauna, Cosmos  
- Assists: Undo (5/game), Hint, Revive (2/game)  

Classic tile art: [samoheen/mahjong-tiles](https://github.com/samoheen/mahjong-tiles) (CC0).
