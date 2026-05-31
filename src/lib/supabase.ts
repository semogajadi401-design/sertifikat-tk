import { createClient } from '@supabase/supabase-js'

export type Student = {
  id?: string
  no_surat: string
  nama: string
  nis: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'Laki-laki' | 'Perempuan'
  created_at?: string
}

export type Settings = {
  id?: string
  tanggal_ttd: string
  nama_kepsek: string
  background_url?: string
}

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env variables not set')
  return createClient(url, key)
}

let _client: ReturnType<typeof createClient> | null = null
export function getSupabaseClient() {
  if (typeof window === 'undefined') return getSupabase()
  if (!_client) _client = getSupabase()
  return _client
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient>]
  }
})
