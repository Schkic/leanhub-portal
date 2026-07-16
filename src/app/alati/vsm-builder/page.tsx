"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, Plus, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Tipovi ───────────────────────────────────────────────────────────────────
type ElementType = 'supplier' | 'customer' | 'process' | 'inventory' | 'transport' | 'supermarket' | 'kaizen' | 'control';

interface VSMElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  naziv: string;
  podaci: Record<string, string>;
}

interface VSMKonekcija {
  id: string;
  fromId: string;
  toId: string;
  tip: 'material' | 'info' | 'push' | 'pull';
}

// ─── Konstante ────────────────────────────────────────────────────────────────
const ELEMENT_DEFS: Record<ElementType, { label: string; emoji: string; w: number; h: number; color: string; fields: string[] }> = {
  supplier:     { label: 'Dobavljač',    emoji: '🏭', w: 120, h: 80,  color: '#1a1a1a', fields: ['Naziv', 'Isporuka', 'Frekvencija'] },
  customer:     { label: 'Kupac',        emoji: '👤', w: 120, h: 80,  color: '#1a7a5e', fields: ['Naziv', 'Potražnja/dan', 'Kontejner'] },
  process:      { label: 'Proces',       emoji: '⬜', w: 140, h: 90,  color: '#1a1a1a', fields: ['Naziv', 'C/T (s)', 'C/O (min)', 'Smjene', 'Dostupnost (%)', 'Operatori'] },
  inventory:    { label: 'Zaliha',       emoji: '▲',  w: 80,  h: 80,  color: '#ca8a04', fields: ['Količina', 'Dani'] },
  transport:    { label: 'Transport',    emoji: '🚚', w: 100, h: 70,  color: '#5a5a5a', fields: ['Naziv', 'Frekvencija', 'Količina'] },
  supermarket:  { label: 'Supermarket', emoji: '📦', w: 100, h: 80,  color: '#1a7a5e', fields: ['Naziv', 'Zaliha', 'Kanban'] },
  kaizen:       { label: 'Kaizen blic', emoji: '⚡', w: 90,  h: 90,  color: '#dc2626', fields: ['Opis', 'Cilj'] },
  control:      { label: 'Kontrola',    emoji: '📋', w: 120, h: 70,  color: '#5a5a5a', fields: ['Naziv', 'Tip'] },
};

const KONEKCIJA_OPCIJE = [
  { tip: 'material', label: 'Materijalni tok', color: '#1a1a1a', dash: '' },
  { tip: 'info',     label: 'Informacijski tok', color: '#1a7a5e', dash: '5,3' },
  { tip: 'push',     label: 'Push strijela',  color: '#ca8a04', dash: '' },
  { tip: 'pull',     label: 'Pull (kanban)',  color: '#dc2626', dash: '3,3' },
];

const genId = () => Math.random().toString(36).slice(2, 9);

// ─── SVG Ikone elemenata ───────────────────────────────────────────────────
function ElementShape({ type, w, h, naziv }: { type: ElementType; w: number; h: number; naziv: string }) {
  const label = naziv || ELEMENT_DEFS[type].label;
  switch (type) {
    case 'supplier':
    case 'customer':
      return (
        <g>
          <rect x={2} y={2} width={w-4} height={h-4} rx={6} fill={type === 'customer' ? '#e8f5f0' : '#f0f0f0'} stroke={ELEMENT_DEFS[type].color} strokeWidth={1.5} />
          <text x={w/2} y={h/2-6} textAnchor="middle" fontSize={18} dominantBaseline="middle">{type === 'supplier' ? '🏭' : '👤'}</text>
          <text x={w/2} y={h/2+14} textAnchor="middle" fontSize={10} fontWeight={600} fill={ELEMENT_DEFS[type].color}>{label}</text>
        </g>
      );
    case 'process':
      return (
        <g>
          <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#1a1a1a" strokeWidth={1.5} />
          <rect x={2} y={2} width={w-4} height={22} rx={4} fill="#f0f0f0" stroke="#1a1a1a" strokeWidth={1.5} />
          <text x={w/2} y={16} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1a1a1a">{label}</text>
          <text x={w/2} y={h/2+8} textAnchor="middle" fontSize={9} fill="#5a5a5a">C/T, C/O, Smjene</text>
        </g>
      );
    case 'inventory':
      return (
        <g>
          <polygon points={`${w/2},4 ${w-4},${h-4} 4,${h-4}`} fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5} />
          <text x={w/2} y={h-16} textAnchor="middle" fontSize={9} fontWeight={600} fill="#ca8a04">{label}</text>
        </g>
      );
    case 'kaizen':
      return (
        <g>
          <circle cx={w/2} cy={h/2} r={w/2-4} fill="#fff3e0" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="4,2" />
          <text x={w/2} y={h/2-6} textAnchor="middle" fontSize={16}>⚡</text>
          <text x={w/2} y={h/2+10} textAnchor="middle" fontSize={9} fontWeight={600} fill="#dc2626">{label}</text>
        </g>
      );
    case 'transport':
      return (
        <g>
          <rect x={2} y={14} width={70} height={38} rx={3} fill="white" stroke="#5a5a5a" strokeWidth={1.5} />
          <path d="M72 22 L90 22 L98 34 L98 52 L72 52 Z" fill="white" stroke="#5a5a5a" strokeWidth={1.5} />
          <circle cx={20} cy={54} r={8} fill="white" stroke="#5a5a5a" strokeWidth={1.5} />
          <circle cx={80} cy={54} r={8} fill="white" stroke="#5a5a5a" strokeWidth={1.5} />
          <text x={w/2} y={h-2} textAnchor="middle" fontSize={9} fontWeight={600} fill="#5a5a5a">{label}</text>
        </g>
      );
    case 'supermarket':
      return (
        <g>
          <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#e8f5f0" stroke="#1a7a5e" strokeWidth={1.5} />
          {[0,1,2].map(i => <line key={i} x1={8} y1={20+i*15} x2={w-8} y2={20+i*15} stroke="#1a7a5e" strokeWidth={1} />)}
          <text x={w/2} y={h-8} textAnchor="middle" fontSize={9} fontWeight={600} fill="#1a7a5e">{label}</text>
        </g>
      );
    case 'control':
      return (
        <g>
          <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#5a5a5a" strokeWidth={1.5} strokeDasharray="4,2" />
          <text x={w/2} y={h/2-4} textAnchor="middle" fontSize={10} fontWeight={600} fill="#5a5a5a">{label}</text>
        </g>
      );
    default:
      return <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#1a1a1a" strokeWidth={1.5} />;
  }
}

// ─── Konekcija strijela ────────────────────────────────────────────────────
function KonekcijaLine({ from, to, tip, elements }: { from: string; to: string; tip: string; elements: VSMElement[] }) {
  const f = elements.find(e => e.id === from);
  const t = elements.find(e => e.id === to);
  if (!f || !t) return null;
  const def = ELEMENT_DEFS[f.type];
  const defT = ELEMENT_DEFS[t.type];
  const x1 = f.x + def.w;
  const y1 = f.y + def.h / 2;
  const x2 = t.x;
  const y2 = t.y + defT.h / 2;
  const opt = KONEKCIJA_OPCIJE.find(k => k.tip === tip) || KONEKCIJA_OPCIJE[0];
  return (
    <g>
      <defs>
        <marker id={`arr-${tip}`} markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={opt.color} />
        </marker>
      </defs>
      <path
        d={`M${x1},${y1} C${x1+40},${y1} ${x2-40},${y2} ${x2},${y2}`}
        fill="none" stroke={opt.color} strokeWidth={1.8}
        strokeDasharray={opt.dash}
        markerEnd={`url(#arr-${tip})`}
      />
    </g>
  );
}

// ─── Glavni komponent ──────────────────────────────────────────────────────
export default function VSMPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [naziv, setNaziv] = useState('Novi VSM dijagram');
  const [elements, setElements] = useState<VSMElement[]>([]);
  const [konekcije, setKonekcije] = useState<VSMKonekcija[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; tip: 'material' | 'info' | 'push' | 'pull' } | null>(null);
  const [propPanel, setPropPanel] = useState(false);
  const [konekcijaMode, setKonekcijaMode] = useState<'material' | 'info' | 'push' | 'pull'>('material');
  const [showKonekcijaToolbar, setShowKonekcijaToolbar] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/prijava');
      else setUser(user);
    });
  }, [router]);

  const addElement = (type: ElementType) => {
    const def = ELEMENT_DEFS[type];
    const el: VSMElement = {
      id: genId(), type,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      naziv: def.label,
      podaci: Object.fromEntries(def.fields.map(f => [f, ''])),
    };
    setElements(prev => [...prev, el]);
    setSelected(el.id);
    setPropPanel(true);
  };

  const getSVGPos = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (connecting) {
      if (connecting.fromId !== id) {
        setKonekcije(prev => [...prev, { id: genId(), fromId: connecting.fromId, toId: id, tip: connecting.tip }]);
      }
      setConnecting(null);
      return;
    }
    const el = elements.find(el => el.id === id)!;
    const pos = getSVGPos(e);
    setDragging({ id, offX: pos.x - el.x, offY: pos.y - el.y });
    setSelected(id);
    setPropPanel(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = getSVGPos(e);
    setElements(prev => prev.map(el =>
      el.id === dragging.id ? { ...el, x: Math.max(0, pos.x - dragging.offX), y: Math.max(0, pos.y - dragging.offY) } : el
    ));
  };

  const onMouseUp = () => setDragging(null);

  const deleteSelected = () => {
    if (!selected) return;
    setElements(prev => prev.filter(e => e.id !== selected));
    setKonekcije(prev => prev.filter(k => k.fromId !== selected && k.toId !== selected));
    setSelected(null);
    setPropPanel(false);
  };

  const startConnect = (id: string) => {
    setConnecting({ fromId: id, tip: konekcijaMode });
    setPropPanel(false);
  };

  const updatePodatak = (field: string, value: string) => {
    if (!selected) return;
    setElements(prev => prev.map(el =>
      el.id === selected ? { ...el, podaci: { ...el.podaci, [field]: value } } : el
    ));
  };

  const updateNazivEl = (value: string) => {
    if (!selected) return;
    setElements(prev => prev.map(el => el.id === selected ? { ...el, naziv: value } : el));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('vsm_dijagram').insert({
      user_id: user.id, naziv, elementi: elements, konekcije,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const selectedEl = elements.find(e => e.id === selected);
  const selectedDef = selectedEl ? ELEMENT_DEFS[selectedEl.type] : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-4">
        <div className="max-w-full flex items-center gap-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">🗺️ VSM Builder</div>
          <input
            type="text"
            className="font-serif text-xl text-[#1a1a1a] bg-transparent border-none outline-none flex-1"
            value={naziv}
            onChange={e => setNaziv(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Spremam...' : 'Spremi'}
            </button>
            {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lijeva paleta */}
        <div className="w-48 bg-white border-r border-[#e2e2e2] p-3 flex flex-col gap-1 overflow-y-auto shrink-0">
          <p className="text-[10px] font-bold text-[#9a9a9a] uppercase tracking-wider mb-2">Elementi</p>
          {(Object.entries(ELEMENT_DEFS) as [ElementType, typeof ELEMENT_DEFS[ElementType]][]).map(([type, def]) => (
            <button key={type} onClick={() => addElement(type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-all border border-transparent hover:border-[#1a7a5e]/20">
              <span>{def.emoji}</span>
              <span className="text-xs font-medium">{def.label}</span>
            </button>
          ))}

          <div className="border-t border-[#e2e2e2] my-2" />
          <p className="text-[10px] font-bold text-[#9a9a9a] uppercase tracking-wider mb-1">Konekcije</p>
          <button onClick={() => setShowKonekcijaToolbar(!showKonekcijaToolbar)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#fafaf8] border border-[#e2e2e2]">
            <span>Tip veze</span>
            {showKonekcijaToolbar ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showKonekcijaToolbar && (
            <div className="space-y-1">
              {KONEKCIJA_OPCIJE.map(opt => (
                <button key={opt.tip} onClick={() => setKonekcijaMode(opt.tip as any)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${konekcijaMode === opt.tip ? 'bg-[#e8f5f0] text-[#1a7a5e] font-bold' : 'hover:bg-[#fafaf8]'}`}>
                  <span style={{ color: opt.color, fontSize: 16 }}>→</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {connecting && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-700 text-center">
              Klikni na ciljni element
              <button onClick={() => setConnecting(null)} className="block w-full mt-1 text-red-500 hover:underline">Odustani</button>
            </div>
          )}

          {selected && (
            <div className="border-t border-[#e2e2e2] mt-2 pt-2 space-y-1">
              <button onClick={() => startConnect(selected)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                <Plus size={12} /> Poveži element
              </button>
              <button onClick={deleteSelected}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                <Trash2 size={12} /> Obriši element
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto relative">
          <svg
            ref={svgRef}
            width={1600} height={900}
            className="bg-[#fafaf8] cursor-default select-none"
            style={{ backgroundImage: 'radial-gradient(#e2e2e2 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onClick={() => { if (!connecting) { setSelected(null); setPropPanel(false); } }}
          >
            {/* Konekcije */}
            {konekcije.map(k => (
              <KonekcijaLine key={k.id} from={k.fromId} to={k.toId} tip={k.tip} elements={elements} />
            ))}

            {/* Elementi */}
            {elements.map(el => {
              const def = ELEMENT_DEFS[el.type];
              const isSelected = selected === el.id;
              return (
                <g key={el.id} transform={`translate(${el.x},${el.y})`}
                  onMouseDown={e => onMouseDown(e, el.id)}
                  style={{ cursor: connecting ? 'crosshair' : 'grab' }}>
                  {isSelected && <rect x={-3} y={-3} width={def.w+6} height={def.h+6} rx={6} fill="none" stroke="#1a7a5e" strokeWidth={2} strokeDasharray="4,2" />}
                  <ElementShape type={el.type} w={def.w} h={def.h} naziv={el.naziv} />
                </g>
              );
            })}

            {/* Prazno stanje */}
            {elements.length === 0 && (
              <g>
                <text x={800} y={380} textAnchor="middle" fontSize={48} opacity={0.2}>🗺️</text>
                <text x={800} y={430} textAnchor="middle" fontSize={16} fill="#9a9a9a">Dodajte elemente iz lijeve palete</text>
                <text x={800} y={455} textAnchor="middle" fontSize={13} fill="#c0c0c0">Kliknite na element → povucite → uredite podatke desno</text>
              </g>
            )}
          </svg>
        </div>

        {/* Desni panel — svojstva */}
        {propPanel && selectedEl && selectedDef && (
          <div className="w-64 bg-white border-l border-[#e2e2e2] p-4 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1a1a1a]">⚙️ Svojstva</h3>
              <button onClick={() => setPropPanel(false)} className="text-[#9a9a9a] hover:text-[#1a1a1a]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#5a5a5a] mb-1">Naziv</label>
                <input type="text" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
                  value={selectedEl.naziv} onChange={e => updateNazivEl(e.target.value)} />
              </div>
              {selectedDef.fields.map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[#5a5a5a] mb-1">{field}</label>
                  <input type="text" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
                    value={selectedEl.podaci[field] || ''} onChange={e => updatePodatak(field, e.target.value)} placeholder={`Unesite ${field.toLowerCase()}...`} />
                </div>
              ))}
              <div className="pt-2 border-t border-[#e2e2e2]">
                <p className="text-xs text-[#9a9a9a] mb-2">Tip: <strong>{selectedDef.label}</strong></p>
                <button onClick={() => startConnect(selectedEl.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-all mb-2">
                  <Plus size={12} /> Poveži s elementom
                </button>
                <button onClick={deleteSelected}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all">
                  <Trash2 size={12} /> Obriši
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="bg-white border-t border-[#e2e2e2] px-6 py-2 flex items-center gap-6 text-xs text-[#9a9a9a] flex-wrap">
        {KONEKCIJA_OPCIJE.map(opt => (
          <span key={opt.tip} className="flex items-center gap-1.5">
            <svg width={24} height={12}>
              <line x1={0} y1={6} x2={20} y2={6} stroke={opt.color} strokeWidth={1.5} strokeDasharray={opt.dash} markerEnd="url(#arr)" />
            </svg>
            {opt.label}
          </span>
        ))}
        <span className="ml-auto">💡 Klikni element za uređivanje · Povuci za premještanje · "Poveži" za crtanje toka</span>
      </div>
    </div>
  );
}
