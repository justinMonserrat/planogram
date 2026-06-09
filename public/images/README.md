# Candy images

Drop product images here and reference them from `src/data/candies.js` by setting
each candy's `image` field, e.g.:

```js
{ id: 'mms-peanut', /* ... */, image: '/images/mms-peanut.png' }
```

Anything under `public/` is served from the site root, so `/images/<file>` works
in both dev and production builds. A local path like this is same-origin, which
means it also renders correctly in the exported PNG (unlike many remote URLs that
block cross-origin use).

Users can still override any image at runtime via the ✎ button on a catalog tile.
