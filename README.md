# Planogram Maker

A candy planogram builder for movie-theater-style concession racks. Drag candies
from a built-in catalog onto a rack you assemble out of **peg tiers** and a
**box bin/shelf**, set how many facings of each, and save / export your layout.

No login. No backend (yet). Everything persists to your browser via
`localStorage`.

---

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (defaults to [http://localhost:5173](http://localhost:5173)). The dev server
opens it automatically.

To build for production:

```bash
npm run build
npm run preview
```

---

## How to use it

1. **Search / filter** the catalog on the left (search box, a **Peg / Box**
  toggle, and category chips).
2. **Add your own candies** with **+ Add candy** (name, category, package type,
  and color are required; image URL optional). Custom candies can be deleted (🗑);
   the built-in ones can't.
3. **Drag** a candy tile onto a **peg slot** in the grid, or into the **box** row
  at the bottom of a bay.
  - Peg candies are meant for the grid; box candies for the box row. Drop one in
  the "wrong" place and it still works but gets a subtle warning.
4. **Build the peg grid** — each bay is a 2D pegboard. Add/remove **rows**
  (the `+ Row` controls above and below) and **columns** (the `+` buttons on the
   left and right edges). Remove a row/column with its ✕ handle.
5. **Move things around** — grab a placed candy **anywhere on its tile** and drag
  it to another empty slot (it moves) or onto an occupied slot (they swap).
   Box-bin items reorder by dragging. Each tile has a single delete button
   (top-right, on hover).
6. **Product images** — click the small **✎ / ＋img** button on a catalog tile to
  paste a product photo URL. Tiles and placements show the photo; if none is set
   (or the image fails to load) they fall back to a clean color tile. Image URLs
   are saved in your browser, so you don't have to edit code.
7. **Undo / redo** — use the ↶ / ↷ toolbar buttons or `Ctrl/Cmd+Z` and
  `Ctrl/Cmd+Shift+Z` (`Ctrl+Y`).
8. **Preview** — toggle the **Preview** button for a clean presentation view
  (no editing chrome). This is exactly what the exported PNG looks like.
9. **Save** a named layout, pick it from the dropdown, and **Load** or **Delete**.
  **New rack** starts over.
10. **Export PNG** (a clean image of the rack), **Export JSON**, or **Import JSON**
  to restore a previously exported file.
11. Your work-in-progress **auto-saves** — refresh the page and it's still there.

> **PNG + image note:** the PNG is rasterized in the browser, so product photos
> must be reachable and **CORS-accessible** (allow cross-origin GET) to appear in
> the export. Photos that block cross-origin use will still display in the app but
> fall back to the color tile in the PNG. For guaranteed results, drop images in
> `public/` and reference them with a local path (e.g. `/images/skittles.png`).

---

## Tech stack

- **React + Vite** (plain JS / JSX)
- **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`) for drag-and-drop
- **html-to-image** for PNG export
- Plain CSS (`src/index.css`)
- `localStorage` for persistence (v1)

---

## Project structure

```
src/
  data/
    candies.js                 # built-in catalog + categories
  lib/
    rack.js                    # rack data model + pure transforms (2D grid)
    exporters.js               # PNG / JSON export + import
    color.js                   # readable text color helper
  storage/
    storage.js                 # the ONLY persistence boundary (localStorage)
    storage.supabase.example.js# reference impl for a future Supabase backend
  context/
    ImagesContext.jsx          # image-URL resolution + editing
    CandyContext.jsx           # merged catalog (built-in + custom) + add/delete
  hooks/
    useHistory.js              # undo / redo state container
  components/
    Catalog.jsx, CatalogTile.jsx, CandyImage.jsx, AddCandyModal.jsx
    RackCanvas.jsx, Bay.jsx, PegSlot.jsx, BoxShelf.jsx
    SlotPlacement.jsx, BoxPlacement.jsx, PlacementContent.jsx
    Toolbar.jsx
  App.jsx                      # state + drag-and-drop orchestration
  main.jsx
```

### Data model

```text
Rack:      { id, name, bays: Bay[] }
Bay:       { id, label, cols, pegTiers: PegTier[], boxShelf: Placement[] }
PegTier:   { id, slots: (Placement | null)[] }   // a grid row; length === cols
Placement: { id, candyId }

Candy:     { id, name, category, packageType, color, image }
  category:    "chocolate" | "gummy" | "lto"
  packageType: "peg" | "box"
  color:       hex used to tint the fallback tile
  image:       optional product photo URL ("" = use color tile)
```

The peg area is a 2D grid: `pegTiers` are rows and each row has `cols` slots, so
you can grow the board up/down (rows) and left/right (columns). The box bin is a
separate flowing list. `normalizeRack()` upgrades older saves (flat
`placements` rows) to the grid model on import/load, so existing layouts keep
working.

---

## How to add Supabase later

The app **only** touches persistence through `src/storage/storage.js`. Every
method is already `async`, so a network backend is a drop-in replacement — no
component changes required.

1. `npm install @supabase/supabase-js`
2. Add env vars to `.env.local`:
  ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
  ```
3. Create the tables (SQL sketch is in `src/storage/storage.supabase.example.js`):
  - `layouts (id text pk, name text, rack jsonb, updated_at bigint)`
  - `wip (id text pk, rack jsonb)`
4. Implement the same interface as `storage.js` using the Supabase client (the
  example file has a ready-to-uncomment implementation).
5. In `src/storage/storage.js`, replace:
  ```js
   export const storage = localStorageBackend
  ```
   with your Supabase-backed `storage`.

The storage interface to implement:

```text
getWip():         Promise<Rack | null>
setWip(rack):     Promise<void>
listLayouts():    Promise<{ id, name, updatedAt }[]>
getLayout(id):    Promise<Rack | null>
saveLayout(rack): Promise<{ id, name, updatedAt }>
deleteLayout(id): Promise<void>
getImageOverrides(): Promise<{ [candyId]: url }>
setImageOverride(candyId, url): Promise<void>
getCustomCandies(): Promise<Candy[]>
saveCustomCandy(candy): Promise<void>
deleteCustomCandy(id): Promise<void>
```

When user accounts arrive, scope `wip` and `layouts` rows by `user_id` and add
Supabase Row Level Security. Public/shareable rack URLs can then be a read-only
view keyed by `layouts.id`.

---

## Out of scope for v1

- User accounts / auth
- Shared or public rack URLs
- A hosted database (see the Supabase section above for where it slots in)

