import { supabase } from './supabase';

export type ActionStatus = 'otvoreno' | 'u_tijeku' | 'zavrseno' | 'odbijeno';

interface AkcijaLike {
  akcija?: string;
  odgovorna?: string;
  rok?: string;
  status?: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

function mapStatus(s?: string): ActionStatus {
  const t = (s || '').toLowerCase();
  if (t.includes('završ') || t.includes('done') || t.includes('closed')) return 'zavrseno';
  if (t.includes('odbij') || t.includes('reject')) return 'odbijeno';
  if (t.includes('tijek') || t.includes('progress')) return 'u_tijeku';
  return 'otvoreno';
}

/**
 * Kopira akcijski plan alata (embeddani jsonb niz {akcija, odgovorna, rok, status})
 * u zasebnu 'actions' tablicu, tako da se odmah pojavljuju na org-wide Akcije ploči.
 * Alat samo poziva ovo nakon uspješnog spremanja svog glavnog zapisa — ništa se u
 * postojećem UI-u alata ne mijenja.
 */
export async function syncAkcijeToActions(
  izvorAlat: string,
  izvorId: string,
  akcije: AkcijaLike[] | undefined | null,
  meta: { locationId?: string | null; departmentId?: string | null } = {}
) {
  const rows = (akcije || [])
    .filter((a) => a?.akcija && a.akcija.trim())
    .map((a) => ({
      naziv: a.akcija!.trim(),
      odgovorna_osoba: a.odgovorna?.trim() || null,
      rok: a.rok && DATE_RE.test(a.rok) ? a.rok : null,
      status: mapStatus(a.status),
      izvor_alat: izvorAlat,
      izvor_id: izvorId,
      location_id: meta.locationId || null,
      department_id: meta.departmentId || null,
    }));

  if (rows.length === 0) return;
  // Best-effort — akcijski plan je sporedni zapis, ne smije blokirati spremanje alata.
  await supabase.from('actions').insert(rows);
}
