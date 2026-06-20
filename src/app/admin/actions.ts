'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  isAuthenticated,
} from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Login: verifica password y setea cookie httpOnly firmada. */
export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    redirect('/admin/login?error=1');
  }
  const token = createSessionToken();
  if (!token) {
    redirect('/admin/login?error=config');
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  redirect('/admin');
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

/** Alta o edición de una propiedad. */
export async function upsertProperty(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const supabase = getSupabaseAdmin();
  if (!supabase) redirect('/admin?error=supabase');

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const slug = slugify(rawSlug || name);

  const included = String(formData.get('included') ?? '')
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const row = {
    slug,
    name,
    zone: String(formData.get('zone') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    included,
    price_mxn: Number(formData.get('price_mxn') ?? 0) || 0,
    image_url: String(formData.get('image_url') ?? '').trim() || null,
    is_active: formData.get('is_active') === 'on',
    beach_clean_badge: formData.get('beach_clean_badge') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  };

  if (!name || !slug) redirect('/admin?error=required');

  const query = id
    ? supabase.from('properties').update(row).eq('id', id)
    : supabase.from('properties').insert(row);

  const { error } = await query;
  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  redirect('/admin?ok=1');
}

export async function deleteProperty(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login');

  const supabase = getSupabaseAdmin();
  if (!supabase) redirect('/admin?error=supabase');

  const id = String(formData.get('id') ?? '').trim();
  if (!id) redirect('/admin');

  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/', 'layout');
  revalidatePath('/admin');
  redirect('/admin?ok=deleted');
}
