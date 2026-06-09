// EXAMPLE ONLY — not imported anywhere. Shows how a Supabase backend would
// implement the exact same interface as src/storage/storage.js.
//
// Steps to enable later:
//   1. npm install @supabase/supabase-js
//   2. Add env vars VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
//   3. Create tables (SQL sketch at the bottom)
//   4. In src/storage/storage.js, replace:
//        export const storage = localStorageBackend
//      with:
//        export { storage } from './storage.supabase.example.js'
//
// Because every component uses the `storage` interface only, nothing else changes.

/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const storage = {
  async getWip() {
    const { data } = await supabase
      .from('wip')
      .select('rack')
      .eq('id', 'singleton')
      .maybeSingle()
    return data?.rack ?? null
  },

  async setWip(rack) {
    await supabase.from('wip').upsert({ id: 'singleton', rack })
  },

  async listLayouts() {
    const { data } = await supabase
      .from('layouts')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false })
    return (data ?? []).map((r) => ({ id: r.id, name: r.name, updatedAt: r.updated_at }))
  },

  async getLayout(id) {
    const { data } = await supabase.from('layouts').select('rack').eq('id', id).maybeSingle()
    return data?.rack ?? null
  },

  async saveLayout(rack) {
    const updatedAt = Date.now()
    await supabase.from('layouts').upsert({
      id: rack.id,
      name: rack.name,
      rack,
      updated_at: updatedAt,
    })
    return { id: rack.id, name: rack.name, updatedAt }
  },

  async deleteLayout(id) {
    await supabase.from('layouts').delete().eq('id', id)
  },
}
*/

// SQL sketch:
//   create table layouts (
//     id text primary key,
//     name text not null,
//     rack jsonb not null,
//     updated_at bigint not null
//   );
//   create table wip (
//     id text primary key,   -- 'singleton' per anonymous user, or user_id when auth lands
//     rack jsonb not null
//   );
