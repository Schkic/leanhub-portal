"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Loc { id: string; naziv: string }
interface Dep { id: string; naziv: string; location_id: string | null }

interface Props {
  locationId: string;
  departmentId: string;
  onChange: (v: { locationId: string; departmentId: string }) => void;
  /**
   * Stil polja. "tailwind" (zadano) koristi iste klase kao ostali inputi u
   * većini alata. "plain" emitira gole <div class="field"> elemente za alate
   * koji stiliziraju kroz globalni CSS (npr. 5x Zašto, Gemba, A3).
   */
  variant?: 'tailwind' | 'plain';
  /** Dodatne klase na svaki wrapper div (npr. "md:col-span-2"). */
  fieldClassName?: string;
}

/**
 * Dva padajuća izbornika — lokacija i odjel organizacije — za "opće podatke"
 * alata. Ako organizacija još nema nijednu lokaciju ni odjel, ne prikazuje
 * ništa (alat ostaje kakav je bio dok korisnik ne posloži strukturu na
 * /organizacija).
 */
export default function LokacijaOdjelPicker({
  locationId, departmentId, onChange, variant = 'tailwind', fieldClassName = '',
}: Props) {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [departments, setDepartments] = useState<Dep[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [loc, dep] = await Promise.all([
        supabase.from('locations').select('id, naziv').order('naziv'),
        supabase.from('departments').select('id, naziv, location_id').order('naziv'),
      ]);
      setLocations(loc.data || []);
      setDepartments(dep.data || []);
      setReady(true);
    })();
  }, []);

  if (!ready || (locations.length === 0 && departments.length === 0)) return null;

  const visibleDeps = locationId
    ? departments.filter((d) => d.location_id === locationId || d.location_id === null)
    : departments;

  const tw =
    'w-full px-3 py-2 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]';
  const twLbl = 'block text-xs font-medium text-[#5a5a5a] mb-1';

  const wrapCls = variant === 'plain' ? `field ${fieldClassName}`.trim() : fieldClassName;
  const selCls = variant === 'plain' ? '' : tw;
  const lblCls = variant === 'plain' ? '' : twLbl;

  return (
    <>
      <div className={wrapCls}>
        <label className={lblCls}>Lokacija</label>
        <select
          className={selCls}
          value={locationId}
          onChange={(e) => onChange({ locationId: e.target.value, departmentId: '' })}
        >
          <option value="">— bez lokacije —</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.naziv}</option>)}
        </select>
      </div>
      <div className={wrapCls}>
        <label className={lblCls}>Odjel</label>
        <select
          className={selCls}
          value={departmentId}
          onChange={(e) => onChange({ locationId, departmentId: e.target.value })}
          disabled={visibleDeps.length === 0}
        >
          <option value="">— bez odjela —</option>
          {visibleDeps.map((d) => <option key={d.id} value={d.id}>{d.naziv}</option>)}
        </select>
      </div>
    </>
  );
}
