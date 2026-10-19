import { AsyncLocalStorage } from "node:async_hooks";
import handler from "vinext/server/app-router-entry";

// Share the store across bundles via globalThis (same technique vinext
// itself uses for its request-context shim).
const KEY = Symbol.for("nb-septic-quiz.env-als");
const g = globalThis as unknown as Record<symbol, AsyncLocalStorage<Record<string, unknown>>>;
const als = (g[KEY] ??= new AsyncLocalStorage<Record<string, unknown>>());

export default {
  async fetch(request: Request, env: Record<string, unknown>, ctx: unknown) {
    return als.run(env, () =>
      handler.fetch(request, env, ctx as never)
    );
  },
};
