# TetrisLand

A Tetris-style game built with **Vue 3**, containerized with **Docker** and **Docker Compose**. The project runs on a Vite dev server inside a container, so you can play or develop it without installing Node.js locally.

> This repository is a fork of [reznikovkg/vue-3-docker-compose](https://github.com/reznikovkg/vue-3-docker-compose), extended with the TetrisLand game on the `kolle_game_tetrisland_lab3` branch.

## About the game

**TetrisLand** is a survival puzzle game: the player controls a growing "island" at the center of a grid while classic Tetris-style shapes fly in from the edges and try to crash into it.

### The field

- The playing field is an **N × N** grid (default `11`). N is configurable via the field-size input, and should always be **odd** so the grid has a single, well-defined center cell.
- At the start of the game, there is exactly **one cell** in the very center of the field — the **core** — this is the player-controlled **island**.

### Controls

| Action | Keyboard | On-screen button |
|---|---|---|
| Move island | Arrow keys (↑ ↓ ← →) | Arrow buttons |
| Rotate island counter-clockwise / clockwise | `Q` / `E` | Curved-arrow buttons |
| Speed up the next flying figure ("turbo") | `Space` | "Ускорить фигуры" button |
| Toggle gradual speed-up mode | `S` | "Режим разгона" button |
| Toggle bomb mode | `B` | "Режим бомб" button |

### Falling shapes

- Shapes are the classic base Tetris tetrominoes (I, O, T, S, Z, L, J), each with its own color, spawned from the currently active shape in the shape editor (defaults to a base tetromino).
- A new figure spawns every **2 seconds**, from a random side of the field, flying straight across toward the opposite side. The spawn side is never the same as the previous figure's.
- When a flying figure's cells overlap with any island cell, it **attaches** to the island (its cells become island cells, keeping the figure's color).
- If a figure flies all the way to the opposite wall without hitting the island, it's removed and the player gets a **-3 points** penalty for missing it.

### Layers, clearing & scoring

- Layers are counted as concentric square rings around the island's original core cell (Chebyshev distance from the core).
- A layer is "full" once it contains exactly the number of cells a complete ring of that radius would have (`layer × 8`).
- When a layer fills up completely:
  - The island **resets down to just its core cell**.
  - Every cell in the cleared layer grants **+5 points**.
  - Every remaining cell that was further out (and falls away) grants **+1 point**.
  - The timer gets a **+60 seconds** bonus.

### Timer & game over

- The game starts with a **60-second** timer that counts down every second; reaching 0 ends the game ("Время вышло! Игра окончена!").
- The island's position is clamped to the field, and the game also ends the instant any island cell touches the outer wall of the field ("Игра окончена! Остров коснулся стены.").
- High score and best survival time are saved to `localStorage` and shown on screen (Рекорд / Лучшее время).

### Goal

Survive as long as possible and rack up the highest score you can — it's a race for the record.

## Bomb mode

Toggle with the **"Режим бомб" (`B`)** button. While active, a bomb spawns every 5 seconds (up to 3 bombs on the field at once), flying in a straight line from a random side like a regular figure:

| Bomb | Spawn chance | Effect on hitting the island |
|---|---|---|
| ⚫ Black | ~45% | Knocks off every attached cell except the core; **-2 points per cell** lost |
| 🔴 Red | ~45% | **-30 seconds** off the timer |
| 🟢 Green (bonus) | ~10% | **+10 seconds** to the timer |

## Speed-up mode

Toggle with the **"Режим разгона" (`S`)** button. While active, the global figure movement speed increases by 1 every 15 seconds. The dedicated turbo action (`Space`) additionally gives the *next single* spawned figure a one-off speed boost.

## Figure editor

Opened via the gear icon button. Lets you manage the set of shapes used by the game:

- Browse all shapes (7 base Tetris shapes + any custom ones) with a live preview and color swatch.
- **Edit** an existing shape's name, color, and cell layout on a 7×7 grid (click cells to toggle them).
- **Save as new** to create a custom shape without overwriting the original.
- **Delete** custom shapes (base shapes I/O/T/S/Z/L/J cannot be deleted).
- **Reset all** to restore the 7 base shapes and discard custom ones.

## Requirements

- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/) (v2 or the standalone `docker-compose` binary)

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/nastya-kolle/vue-3-docker-compose.git
   cd vue-3-docker-compose
   ```

2. Build and start the container:

   ```bash
   docker-compose up --build
   ```

3. Open the game in your browser:

   ```
   http://localhost:9999
   ```

   The container's internal Vite dev server runs on port `5173`, which is mapped to port `9999` on your host machine (see `docker-compose.yml`).

## How it works

The `docker-compose.yml` builds an image from the `./vue` directory and mounts the following as volumes for live development:

- `./vue/src` → `/vue/src`
- `./vue/package.json` → `/vue/package.json`

This means any changes you make to the source files or `package.json` are reflected inside the running container without needing to rebuild the image, enabling hot-reload during development.

To stop the container:

```bash
docker-compose down
```
