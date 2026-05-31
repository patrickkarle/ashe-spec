/**
 * vitest setup: if ASHE_CONFORMANCE_ADAPTER names a module, import it and register
 * its default export as the global adapter. Otherwise leave it unset, and every
 * group skips. Kept dependency-free (no path module) so the scaffold runs anywhere.
 */
export {}; // ensure module scope so top-level await is permitted

const ref = process.env.ASHE_CONFORMANCE_ADAPTER;
if (ref) {
  const specifier = ref.startsWith(".") || ref.startsWith("/") ? ref : `./${ref}`;
  const mod = (await import(specifier)) as { default?: unknown; adapter?: unknown };
  (globalThis as { __ASHE_ADAPTER__?: unknown }).__ASHE_ADAPTER__ = mod.default ?? mod.adapter;
}
