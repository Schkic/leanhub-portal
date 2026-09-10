"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentOrg, type CurrentOrg } from '@/lib/supabase';
import {
  Loader2, Building2, MapPin, Boxes, Users, Mail, Plus, Trash2,
  Check, Link2, Pencil, X, ShieldCheck,
} from 'lucide-react';

type Role = 'owner' | 'admin' | 'manager' | 'auditor' | 'user' | 'viewer';

const ROLE_LABEL: Record<Role, string> = {
  owner: 'Vlasnik',
  admin: 'Administrator',
  manager: 'Voditelj',
  auditor: 'Auditor',
  user: 'Član',
  viewer: 'Promatrač',
};
const ROLE_DESC: Record<Role, string> = {
  owner: 'Puna kontrola, uključujući naplatu i brisanje organizacije.',
  admin: 'Upravlja lokacijama, odjelima i članovima.',
  manager: 'Vodi tim i akcije, vidi izvještaje po lokaciji/odjelu.',
  auditor: 'Provodi audite i unosi zapise.',
  user: 'Unosi i uređuje vlastite zapise.',
  viewer: 'Samo pregled, bez unosa.',
};
// Role koje administrator smije dodijeliti (owner se ne dijeli kroz UI)
const ASSIGNABLE_ROLES: Role[] = ['admin', 'manager', 'auditor', 'user', 'viewer'];
const INVITE_ROLES: Role[] = ['admin', 'manager', 'auditor', 'user', 'viewer'];

interface Location { id: string; naziv: string; adresa: string | null }
interface Department { id: string; naziv: string; location_id: string | null }
interface Member { user_id: string; email: string; role: Role; is_self: boolean }
interface Invite {
  id: string; token: string; role: Role; label: string | null;
  created_at: string; expires_at: string; used_at: string | null;
}

const card = 'bg-white border border-[#e2e2e2] rounded-2xl p-6';
const sectionTitle = 'flex items-center gap-2.5 mb-4';
const inputCls =
  'border border-[#e2e2e2] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a7a5e] transition-colors';
const btnPrimary =
  'inline-flex items-center gap-1.5 bg-[#1a7a5e] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#155f49] transition-all disabled:opacity-60';
const btnGhost =
  'inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a5a5a] hover:text-[#dc2626] transition-colors';

export default function OrganizacijaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<CurrentOrg | null>(null);

  // onboarding
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  // management data
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  const isAdmin = org?.role === 'owner' || org?.role === 'admin';

  const loadManagement = useCallback(async () => {
    const [loc, dep, mem, inv] = await Promise.all([
      supabase.from('locations').select('id, naziv, adresa').order('created_at'),
      supabase.from('departments').select('id, naziv, location_id').order('created_at'),
      supabase.rpc('org_members'),
      supabase.from('org_invites').select('id, token, role, label, created_at, expires_at, used_at').order('created_at', { ascending: false }),
    ]);
    setLocations(loc.data || []);
    setDepartments(dep.data || []);
    setMembers((mem.data as Member[]) || []);
    setInvites((inv.data as Invite[]) || []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/prijava'); return; }
      const o = await getCurrentOrg();
      setOrg(o);
      if (o) await loadManagement();
      setLoading(false);
    })();
  }, [router, loadManagement]);

  const createOrg = async () => {
    setCreating(true);
    setOnboardError(null);
    const { data, error } = await supabase.rpc('create_organization', { p_naziv: newOrgName });
    setCreating(false);
    if (error || !data?.ok) {
      setOnboardError(
        data?.error === 'already_member'
          ? 'Već ste član organizacije.'
          : 'Greška pri kreiranju organizacije.'
      );
      return;
    }
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#9a9a9a]">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  // ─────────────────────────────────────────── ONBOARDING ──
  if (!org) {
    return (
      <div className="bg-[#fafaf8] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[460px] w-full">
          <div className="w-14 h-14 bg-[#e8f5f0] text-[#1a7a5e] rounded-2xl flex items-center justify-center mb-5">
            <Building2 size={26} />
          </div>
          <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">Postavite svoju organizaciju</h1>
          <p className="text-[#5a5a5a] mb-6 leading-relaxed">
            Organizacija povezuje vaše lokacije, odjele i članove tima. Svi Lean alati i
            zapisi žive unutar nje.
          </p>
          <div className={card}>
            <label className="text-xs font-semibold text-[#5a5a5a] block mb-1.5">Naziv organizacije</label>
            <input
              className={`${inputCls} w-full mb-4`}
              placeholder="npr. Metalka d.o.o."
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            {onboardError && <p className="text-sm text-red-600 mb-3">{onboardError}</p>}
            <button onClick={createOrg} disabled={creating || !newOrgName.trim()} className={`${btnPrimary} w-full justify-center`}>
              {creating ? <Loader2 className="animate-spin" size={16} /> : <>Kreiraj organizaciju</>}
            </button>
          </div>
          <p className="text-xs text-[#9a9a9a] mt-5 text-center">
            Imate pozivnicu? Otvorite poveznicu koju vam je poslao administrator tima.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────── MANAGEMENT ──
  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      <div className="max-w-[900px] mx-auto px-6 py-10 space-y-6">
        <OrgHeader org={org} isAdmin={isAdmin} onSaved={async () => setOrg(await getCurrentOrg())} />

        <LocationsCard
          orgId={org.org_id}
          locations={locations}
          isAdmin={isAdmin}
          reload={loadManagement}
        />

        <DepartmentsCard
          orgId={org.org_id}
          departments={departments}
          locations={locations}
          isAdmin={isAdmin}
          reload={loadManagement}
        />

        <MembersCard
          members={members}
          myRole={org.role}
          reload={loadManagement}
        />

        <InvitesCard
          orgId={org.org_id}
          invites={invites}
          isAdmin={isAdmin}
          reload={loadManagement}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────── Header ──
function OrgHeader({ org, isAdmin, onSaved }: { org: CurrentOrg; isAdmin: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [naziv, setNaziv] = useState(org.naziv);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await supabase.from('organizations').update({ naziv: naziv.trim() || org.naziv }).eq('id', org.org_id);
    setBusy(false);
    setEditing(false);
    onSaved();
  };

  return (
    <div className={card}>
      <div className={sectionTitle}>
        <div className="w-9 h-9 bg-[#e8f5f0] text-[#1a7a5e] rounded-lg flex items-center justify-center"><Building2 size={18} /></div>
        <h2 className="font-bold text-[#1a1a1a]">Organizacija</h2>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#1a7a5e] bg-[#e8f5f0] px-2.5 py-1 rounded-full">
          <ShieldCheck size={12} /> {ROLE_LABEL[org.role]}
        </span>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input className={`${inputCls} flex-1`} value={naziv} onChange={(e) => setNaziv(e.target.value)} autoFocus />
          <button onClick={save} disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Spremi
          </button>
          <button onClick={() => { setNaziv(org.naziv); setEditing(false); }} className={btnGhost}><X size={16} /></button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-xl font-serif text-[#1a1a1a]">{org.naziv}</span>
          {isAdmin && (
            <button onClick={() => setEditing(true)} className="text-[#9a9a9a] hover:text-[#1a7a5e] transition-colors">
              <Pencil size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────── Locations ──
function LocationsCard({ orgId, locations, isAdmin, reload }: { orgId: string; locations: Location[]; isAdmin: boolean; reload: () => Promise<void> }) {
  const [naziv, setNaziv] = useState('');
  const [adresa, setAdresa] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!naziv.trim()) return;
    setBusy(true);
    await supabase.from('locations').insert({ org_id: orgId, naziv: naziv.trim(), adresa: adresa.trim() || null });
    setNaziv(''); setAdresa('');
    await reload();
    setBusy(false);
  };
  const del = async (id: string) => {
    await supabase.from('locations').delete().eq('id', id);
    await reload();
  };

  return (
    <div className={card}>
      <div className={sectionTitle}>
        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><MapPin size={18} /></div>
        <h2 className="font-bold text-[#1a1a1a]">Lokacije</h2>
        <span className="text-xs text-[#9a9a9a]">({locations.length})</span>
      </div>

      {locations.length === 0 && <p className="text-sm text-[#9a9a9a] mb-4">Još nema lokacija.</p>}
      <div className="space-y-2 mb-4">
        {locations.map((l) => (
          <div key={l.id} className="flex items-center gap-3 bg-[#fafaf8] border border-[#e2e2e2] rounded-lg px-3 py-2.5">
            <MapPin size={15} className="text-[#9a9a9a] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1a1a1a] truncate">{l.naziv}</div>
              {l.adresa && <div className="text-xs text-[#9a9a9a] truncate">{l.adresa}</div>}
            </div>
            {isAdmin && (
              <button onClick={() => del(l.id)} className={btnGhost} title="Obriši lokaciju"><Trash2 size={15} /></button>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input className={`${inputCls} flex-1`} placeholder="Naziv lokacije" value={naziv} onChange={(e) => setNaziv(e.target.value)} />
          <input className={`${inputCls} flex-1`} placeholder="Adresa (nije obavezno)" value={adresa} onChange={(e) => setAdresa(e.target.value)} />
          <button onClick={add} disabled={busy || !naziv.trim()} className={btnPrimary}><Plus size={16} /> Dodaj</button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────── Departments ──
function DepartmentsCard({ orgId, departments, locations, isAdmin, reload }: {
  orgId: string; departments: Department[]; locations: Location[]; isAdmin: boolean; reload: () => Promise<void>;
}) {
  const [naziv, setNaziv] = useState('');
  const [locId, setLocId] = useState('');
  const [busy, setBusy] = useState(false);
  const locName = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l.naziv])), [locations]);

  const add = async () => {
    if (!naziv.trim()) return;
    setBusy(true);
    await supabase.from('departments').insert({ org_id: orgId, naziv: naziv.trim(), location_id: locId || null });
    setNaziv(''); setLocId('');
    await reload();
    setBusy(false);
  };
  const del = async (id: string) => {
    await supabase.from('departments').delete().eq('id', id);
    await reload();
  };

  return (
    <div className={card}>
      <div className={sectionTitle}>
        <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><Boxes size={18} /></div>
        <h2 className="font-bold text-[#1a1a1a]">Odjeli</h2>
        <span className="text-xs text-[#9a9a9a]">({departments.length})</span>
      </div>

      {departments.length === 0 && <p className="text-sm text-[#9a9a9a] mb-4">Još nema odjela.</p>}
      <div className="space-y-2 mb-4">
        {departments.map((d) => (
          <div key={d.id} className="flex items-center gap-3 bg-[#fafaf8] border border-[#e2e2e2] rounded-lg px-3 py-2.5">
            <Boxes size={15} className="text-[#9a9a9a] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1a1a1a] truncate">{d.naziv}</div>
              {d.location_id && <div className="text-xs text-[#9a9a9a] truncate">{locName[d.location_id] || 'Lokacija'}</div>}
            </div>
            {isAdmin && (
              <button onClick={() => del(d.id)} className={btnGhost} title="Obriši odjel"><Trash2 size={15} /></button>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input className={`${inputCls} flex-1`} placeholder="Naziv odjela" value={naziv} onChange={(e) => setNaziv(e.target.value)} />
          <select className={`${inputCls} flex-1`} value={locId} onChange={(e) => setLocId(e.target.value)}>
            <option value="">Bez lokacije</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.naziv}</option>)}
          </select>
          <button onClick={add} disabled={busy || !naziv.trim()} className={btnPrimary}><Plus size={16} /> Dodaj</button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────── Members ──
function MembersCard({ members, myRole, reload }: { members: Member[]; myRole: Role; reload: () => Promise<void> }) {
  const canManage = myRole === 'owner' || myRole === 'admin';

  const changeRole = async (m: Member, role: Role) => {
    await supabase.from('memberships').update({ role }).eq('user_id', m.user_id);
    await reload();
  };
  const remove = async (m: Member) => {
    if (!confirm(`Ukloniti ${m.email} iz organizacije?`)) return;
    await supabase.from('memberships').delete().eq('user_id', m.user_id);
    await reload();
  };

  return (
    <div className={card}>
      <div className={sectionTitle}>
        <div className="w-9 h-9 bg-[#e8f5f0] text-[#1a7a5e] rounded-lg flex items-center justify-center"><Users size={18} /></div>
        <h2 className="font-bold text-[#1a1a1a]">Članovi tima</h2>
        <span className="text-xs text-[#9a9a9a]">({members.length})</span>
      </div>

      <div className="space-y-2">
        {members.map((m) => {
          const editable = canManage && !m.is_self && m.role !== 'owner';
          return (
            <div key={m.user_id} className="flex flex-wrap items-center gap-3 bg-[#fafaf8] border border-[#e2e2e2] rounded-lg px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#e2e2e2] flex items-center justify-center text-[#1a7a5e] shrink-0">
                <Mail size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#1a1a1a] truncate">
                  {m.email}{m.is_self && <span className="text-[#9a9a9a] font-normal"> (vi)</span>}
                </div>
                <div className="text-xs text-[#9a9a9a]">{ROLE_DESC[m.role]}</div>
              </div>
              {editable ? (
                <select
                  className={`${inputCls} py-1.5`}
                  value={m.role}
                  onChange={(e) => changeRole(m, e.target.value as Role)}
                >
                  {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              ) : (
                <span className="text-xs font-bold text-[#5a5a5a] bg-white border border-[#e2e2e2] px-2.5 py-1 rounded-full">
                  {ROLE_LABEL[m.role]}
                </span>
              )}
              {editable && (
                <button onClick={() => remove(m)} className={btnGhost} title="Ukloni člana"><Trash2 size={15} /></button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────── Invites ──
function InvitesCard({ orgId, invites, isAdmin, reload }: { orgId: string; invites: Invite[]; isAdmin: boolean; reload: () => Promise<void> }) {
  const [role, setRole] = useState<Role>('user');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pending = invites.filter((i) => !i.used_at && new Date(i.expires_at) > new Date());
  const inactive = invites.filter((i) => i.used_at || new Date(i.expires_at) <= new Date());

  const linkFor = (token: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/pridruzi/${token}`;

  const create = async () => {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('org_invites').insert({
      org_id: orgId,
      role,
      label: label.trim() || null,
      created_by: user?.id ?? null,
    });
    setLabel('');
    await reload();
    setBusy(false);
  };
  const revoke = async (id: string) => {
    await supabase.from('org_invites').delete().eq('id', id);
    await reload();
  };
  const copy = (inv: Invite) => {
    navigator.clipboard.writeText(linkFor(inv.token));
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAdmin) return null;

  return (
    <div className={card}>
      <div className={sectionTitle}>
        <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center"><Link2 size={18} /></div>
        <h2 className="font-bold text-[#1a1a1a]">Pozivnice</h2>
      </div>
      <p className="text-sm text-[#5a5a5a] mb-4">
        Kreirajte jednokratnu poveznicu, odaberite ulogu i pošaljite je kolegi. Vrijedi 14 dana
        ili do prvog korištenja.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input className={`${inputCls} flex-1`} placeholder="Napomena (npr. Voditelj proizvodnje)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <select className={`${inputCls}`} value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {INVITE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <button onClick={create} disabled={busy} className={btnPrimary}><Plus size={16} /> Kreiraj</button>
      </div>

      {pending.length > 0 && (
        <div className="space-y-2 mb-4">
          {pending.map((inv) => (
            <div key={inv.id} className="bg-[#fafaf8] border border-[#e2e2e2] rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#5a5a5a] bg-white border border-[#e2e2e2] px-2 py-0.5 rounded-full">{ROLE_LABEL[inv.role]}</span>
                {inv.label && <span className="text-xs text-[#5a5a5a]">{inv.label}</span>}
                <span className="text-[11px] text-[#9a9a9a] ml-auto">ističe {new Date(inv.expires_at).toLocaleDateString('hr-HR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <input readOnly value={linkFor(inv.token)} className="flex-1 bg-white border border-[#e2e2e2] rounded px-2 py-1 text-xs text-[#5a5a5a] outline-none truncate" />
                <button onClick={() => copy(inv)} className="shrink-0 text-xs font-semibold text-[#1a7a5e] hover:underline flex items-center gap-1">
                  {copiedId === inv.id ? <><Check size={13} /> Kopirano</> : 'Kopiraj'}
                </button>
                <button onClick={() => revoke(inv.id)} className={btnGhost} title="Poništi pozivnicu"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <details className="text-sm">
          <summary className="text-xs font-semibold text-[#9a9a9a] cursor-pointer">Iskorištene / istekle ({inactive.length})</summary>
          <div className="space-y-1.5 mt-2">
            {inactive.map((inv) => (
              <div key={inv.id} className="flex items-center gap-2 text-xs text-[#9a9a9a] px-3 py-1.5">
                <span className="font-semibold">{ROLE_LABEL[inv.role]}</span>
                {inv.label && <span>· {inv.label}</span>}
                <span className="ml-auto">{inv.used_at ? 'iskorištena' : 'istekla'}</span>
                <button onClick={() => revoke(inv.id)} className={btnGhost}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
