"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase, requireAuth } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, Plus, X, ChevronDown, ChevronUp, HelpCircle, BookOpen, Image as ImageIcon } from 'lucide-react';

type ElementType = 'supplier' | 'customer' | 'process' | 'inventory' | 'transport' |
  'supermarket' | 'kaizen' | 'control' | 'fifo' | 'operator' |
  'kanban_prod' | 'kanban_pull' | 'kanban_signal' | 'kanban_box' | 'timeline';

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
  tip: 'material' | 'info' | 'push' | 'pull' | 'einfo' | 'rinfo';
}

const ELEMENT_DEFS: Record<ElementType, { label: string; emoji: string; w: number; h: number; group: string; fields: string[] }> = {
  // Proces simboli
  supplier:     { label: 'Dobavljač',        emoji: '🏭', w: 120, h: 80,  group: 'Proces',   fields: ['Isporuka', 'Frekvencija'] },
  customer:     { label: 'Kupac',            emoji: '👤', w: 120, h: 80,  group: 'Proces',   fields: ['Potražnja/dan', 'Kontejner'] },
  process:      { label: 'Proces',           emoji: '⬜', w: 140, h: 90,  group: 'Proces',   fields: ['C/T (s)', 'C/O (min)', 'Smjene', 'Dostupnost (%)', 'Operatori'] },
  operator:     { label: 'Radnik/Operator',  emoji: '👷', w: 60,  h: 70,  group: 'Proces',   fields: ['Broj operatora'] },
  control:      { label: 'Planiranje (PPC)', emoji: '📋', w: 120, h: 70,  group: 'Proces',   fields: ['Naziv', 'Tip'] },
  // Materijal simboli
  inventory:    { label: 'Zaliha',           emoji: '▲',  w: 80,  h: 80,  group: 'Materijal', fields: ['Količina', 'Dani'] },
  supermarket:  { label: 'Supermarket',      emoji: '📦', w: 100, h: 80,  group: 'Materijal', fields: ['Zaliha', 'Kanban'] },
  fifo:         { label: 'FIFO traka',       emoji: '➡️', w: 120, h: 50,  group: 'Materijal', fields: ['Kapacitet', 'Dani'] },
  transport:    { label: 'Transport',        emoji: '🚚', w: 100, h: 70,  group: 'Materijal', fields: ['Frekvencija', 'Količina'] },
  // Kanban simboli
  kanban_prod:  { label: 'Proizvodni kanban',emoji: '🎴', w: 70,  h: 50,  group: 'Kanban',   fields: ['Dio broj', 'Količina'] },
  kanban_pull:  { label: 'Povlačeći kanban', emoji: '🔄', w: 70,  h: 50,  group: 'Kanban',   fields: ['Dio broj', 'Količina'] },
  kanban_signal:{ label: 'Signalni kanban',  emoji: '🔺', w: 60,  h: 60,  group: 'Kanban',   fields: ['Razina', 'Dio broj'] },
  kanban_box:   { label: 'Kanban kutija',    emoji: '📫', w: 80,  h: 60,  group: 'Kanban',   fields: ['Kapacitet'] },
  // Ostalo
  kaizen:       { label: 'Kaizen blic',      emoji: '⚡', w: 90,  h: 90,  group: 'Ostalo',   fields: ['Opis', 'Cilj'] },
  timeline:     { label: 'Vremenska linija', emoji: '📏', w: 200, h: 60,  group: 'Ostalo',   fields: ['VAT (s)', 'NVAT (s)'] },
};

const ELEMENT_GROUPS = ['Proces', 'Materijal', 'Kanban', 'Ostalo'];

const KONEKCIJA_OPCIJE = [
  { tip: 'material', label: 'Materijalni tok',         color: '#1a1a1a', dash: '',    opis: 'Fizički tok materijala' },
  { tip: 'push',     label: 'Push strijela',           color: '#ca8a04', dash: '',    opis: 'Guranje materijala' },
  { tip: 'pull',     label: 'Pull / Kanban',           color: '#dc2626', dash: '3,3', opis: 'Povlačenje materijala' },
  { tip: 'info',     label: 'Informacijski tok',       color: '#1a7a5e', dash: '5,3', opis: 'Ručni tok informacija' },
  { tip: 'einfo',    label: 'El. tok informacija',     color: '#2563eb', dash: '5,3', opis: 'Elektronički (email, ERP...)' },
  { tip: 'rinfo',    label: 'Povratne informacije',    color: '#7c3aed', dash: '3,2', opis: 'Povratna veza' },
];

const genId = () => Math.random().toString(36).slice(2, 9);

// ─── SVG Simboli ──────────────────────────────────────────────────────────────
function ElementShape({ type, w, h, naziv }: { type: ElementType; w: number; h: number; naziv: string }) {
  const label = naziv || ELEMENT_DEFS[type].label;
  switch (type) {
    case 'supplier':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={5} fill="#f0f0f0" stroke="#1a1a1a" strokeWidth={1.5}/>
        <text x={w/2} y={h/2-8} textAnchor="middle" fontSize={20} dominantBaseline="middle">🏭</text>
        <text x={w/2} y={h/2+14} textAnchor="middle" fontSize={10} fontWeight={600} fill="#1a1a1a">{label}</text>
      </g>;
    case 'customer':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={5} fill="#e8f5f0" stroke="#1a7a5e" strokeWidth={1.5}/>
        <text x={w/2} y={h/2-8} textAnchor="middle" fontSize={20} dominantBaseline="middle">👤</text>
        <text x={w/2} y={h/2+14} textAnchor="middle" fontSize={10} fontWeight={600} fill="#1a7a5e">{label}</text>
      </g>;
    case 'process':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#1a1a1a" strokeWidth={1.5}/>
        <rect x={2} y={2} width={w-4} height={20} rx={4} fill="#f0f0f0" stroke="#1a1a1a" strokeWidth={1.5}/>
        <text x={w/2} y={14} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1a1a1a">{label}</text>
        <line x1={8} y1={34} x2={w-8} y2={34} stroke="#e2e2e2" strokeWidth={1}/>
        <text x={10} y={46} fontSize={8} fill="#5a5a5a">C/T:</text>
        <text x={10} y={56} fontSize={8} fill="#5a5a5a">C/O:</text>
        <text x={10} y={66} fontSize={8} fill="#5a5a5a">Smjene:</text>
        <text x={55} y={46} fontSize={8} fill="#9a9a9a">—</text>
        <text x={55} y={56} fontSize={8} fill="#9a9a9a">—</text>
        <text x={55} y={66} fontSize={8} fill="#9a9a9a">—</text>
      </g>;
    case 'operator':
      return <g>
        <circle cx={w/2} cy={22} r={14} fill="white" stroke="#1a1a1a" strokeWidth={1.5}/>
        <text x={w/2} y={22} textAnchor="middle" fontSize={14} dominantBaseline="middle">👷</text>
        <line x1={w/2} y1={36} x2={w/2} y2={54} stroke="#1a1a1a" strokeWidth={1.5}/>
        <line x1={w/2-14} y1={46} x2={w/2+14} y2={46} stroke="#1a1a1a" strokeWidth={1.5}/>
        <line x1={w/2} y1={54} x2={w/2-10} y2={66} stroke="#1a1a1a" strokeWidth={1.5}/>
        <line x1={w/2} y1={54} x2={w/2+10} y2={66} stroke="#1a1a1a" strokeWidth={1.5}/>
      </g>;
    case 'control':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#5a5a5a" strokeWidth={1.5} strokeDasharray="4,2"/>
        <text x={w/2} y={h/2-6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#5a5a5a">{label}</text>
        <text x={w/2} y={h/2+8} textAnchor="middle" fontSize={9} fill="#9a9a9a">PPC/MRP</text>
      </g>;
    case 'inventory':
      return <g>
        <polygon points={`${w/2},4 ${w-4},${h-4} 4,${h-4}`} fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5}/>
        <text x={w/2} y={h/2+10} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ca8a04">I</text>
      </g>;
    case 'supermarket':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#e8f5f0" stroke="#1a7a5e" strokeWidth={1.5}/>
        {[0,1,2].map(i => <line key={i} x1={8} y1={18+i*14} x2={w-8} y2={18+i*14} stroke="#1a7a5e" strokeWidth={1}/>)}
        <text x={w/2} y={h-8} textAnchor="middle" fontSize={9} fontWeight={600} fill="#1a7a5e">{label}</text>
      </g>;
    case 'fifo':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#1a1a1a" strokeWidth={1.5}/>
        <text x={w/2} y={h/2-2} textAnchor="middle" fontSize={11} fontWeight={800} fill="#1a1a1a">FIFO</text>
        <text x={12} y={h/2+10} fontSize={14} fill="#1a1a1a">→</text>
        <text x={w/2+10} y={h/2+10} fontSize={9} fill="#9a9a9a">{label}</text>
      </g>;
    case 'transport':
      return <g>
        <rect x={2} y={12} width={65} height={36} rx={3} fill="white" stroke="#5a5a5a" strokeWidth={1.5}/>
        <path d="M67 20 L85 20 L93 32 L93 48 L67 48 Z" fill="white" stroke="#5a5a5a" strokeWidth={1.5}/>
        <circle cx={18} cy={50} r={8} fill="white" stroke="#5a5a5a" strokeWidth={1.5}/>
        <circle cx={75} cy={50} r={8} fill="white" stroke="#5a5a5a" strokeWidth={1.5}/>
        <text x={w/2} y={h} textAnchor="middle" fontSize={9} fontWeight={600} fill="#5a5a5a">{label}</text>
      </g>;
    case 'kanban_prod':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={3} fill="white" stroke="#1a1a1a" strokeWidth={1.5}/>
        <line x1={2} y1={2} x2={w-2} y2={h-2} stroke="#1a1a1a" strokeWidth={1}/>
        <text x={w/2} y={h/2+2} textAnchor="middle" fontSize={8} fontWeight={600} fill="#1a1a1a">{label}</text>
      </g>;
    case 'kanban_pull':
      return <g>
        <circle cx={w/2} cy={h/2} r={Math.min(w,h)/2-4} fill="white" stroke="#ca8a04" strokeWidth={1.5}/>
        <line x1={8} y1={8} x2={w-8} y2={h-8} stroke="#ca8a04" strokeWidth={1}/>
        <text x={w/2} y={h/2+10} textAnchor="middle" fontSize={7} fill="#ca8a04">{label}</text>
      </g>;
    case 'kanban_signal':
      return <g>
        <polygon points={`4,4 ${w-4},4 ${w/2},${h-4}`} fill="#fef9c3" stroke="#ca8a04" strokeWidth={1.5}/>
        <text x={w/2} y={h/2+4} textAnchor="middle" fontSize={7} fontWeight={600} fill="#ca8a04">SIG</text>
      </g>;
    case 'kanban_box':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={3} fill="white" stroke="#1a1a1a" strokeWidth={1.5}/>
        {[1,2,3].map(i => <line key={i} x1={2+i*(w-4)/4} y1={2} x2={2+i*(w-4)/4} y2={h-2} stroke="#1a1a1a" strokeWidth={1}/>)}
        <text x={w/2} y={h-6} textAnchor="middle" fontSize={7} fill="#5a5a5a">{label}</text>
      </g>;
    case 'timeline':
      return <g>
        <rect x={2} y={2} width={w-4} height={h-4} rx={3} fill="white" stroke="#5a5a5a" strokeWidth={1}/>
        {/* VAT koraci */}
        {[0,1,2,3].map(i => (
          <g key={i}>
            <rect x={6+i*48} y={6} width={36} height={22} rx={2} fill="#e8f5f0" stroke="#1a7a5e" strokeWidth={1}/>
            <text x={24+i*48} y={20} textAnchor="middle" fontSize={7} fill="#1a7a5e">VA</text>
          </g>
        ))}
        {/* NVAT koraci */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x={30+i*48} y={6} width={20} height={22} rx={2} fill="#fee2e2" stroke="#dc2626" strokeWidth={1}/>
            <text x={40+i*48} y={20} textAnchor="middle" fontSize={7} fill="#dc2626">NVA</text>
          </g>
        ))}
        <text x={w/2} y={h-6} textAnchor="middle" fontSize={8} fill="#5a5a5a">{label}</text>
      </g>;
    case 'kaizen':
      return <g>
        <path d={`M${w/2},4 L${w/2+12},${h/3} L${w-6},${h/3-6} L${w-10},${h/2} L${w-4},${h-8} L${w/2},${h-14} L${8},${h-8} L${12},${h/2} L${6},${h/3-6} L${w/2-12},${h/3} Z`}
          fill="#fff3e0" stroke="#dc2626" strokeWidth={1.5}/>
        <text x={w/2} y={h/2-4} textAnchor="middle" fontSize={13}>⚡</text>
        <text x={w/2} y={h/2+10} textAnchor="middle" fontSize={8} fontWeight={700} fill="#dc2626">Kaizen</text>
      </g>;
    default:
      return <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="white" stroke="#1a1a1a" strokeWidth={1.5}/>;
  }
}

// ─── Konekcija ────────────────────────────────────────────────────────────────
function KonekcijaLine({ from, to, tip, elements }: { from: string; to: string; tip: string; elements: VSMElement[] }) {
  const f = elements.find(e => e.id === from);
  const t = elements.find(e => e.id === to);
  if (!f || !t) return null;
  const x1 = f.x + ELEMENT_DEFS[f.type].w;
  const y1 = f.y + ELEMENT_DEFS[f.type].h / 2;
  const x2 = t.x;
  const y2 = t.y + ELEMENT_DEFS[t.type].h / 2;
  const opt = KONEKCIJA_OPCIJE.find(k => k.tip === tip) || KONEKCIJA_OPCIJE[0];
  const mid = (x1 + x2) / 2;

  // Push strijela — s bijelim kvadratima unutar
  if (tip === 'push') {
    return <g>
      <defs><marker id="arr-push" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={opt.color}/></marker></defs>
      <path d={`M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`} fill="none" stroke={opt.color} strokeWidth={2} markerEnd="url(#arr-push)"/>
      {[0.3,0.5,0.7].map((t, i) => {
        const bx = x1 + (x2-x1)*t - 5;
        const by = y1 + (y2-y1)*t - 5;
        return <rect key={i} x={bx} y={by} width={10} height={10} fill="white" stroke={opt.color} strokeWidth={1}/>;
      })}
    </g>;
  }

  // Elektronički tok — munja/zigzag
  if (tip === 'einfo') {
    const mx = (x1+x2)/2;
    const my = (y1+y2)/2;
    return <g>
      <defs><marker id="arr-einfo" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={opt.color}/></marker></defs>
      <path d={`M${x1},${y1} C${x1+40},${y1} ${x2-40},${y2} ${x2},${y2}`} fill="none" stroke={opt.color} strokeWidth={1.5} strokeDasharray={opt.dash} markerEnd="url(#arr-einfo)"/>
      <text x={mx} y={my-8} textAnchor="middle" fontSize={14} fill={opt.color}>⚡</text>
    </g>;
  }

  return <g>
    <defs><marker id={`arr-${tip}`} markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={opt.color}/></marker></defs>
    <path d={`M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`} fill="none" stroke={opt.color} strokeWidth={1.8} strokeDasharray={opt.dash} markerEnd={`url(#arr-${tip})`}/>
  </g>;
}

// ─── Glavni komponent ──────────────────────────────────────────────────────────
export default function VSMPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const [naziv, setNaziv] = useState('Novi VSM dijagram');
  const [elements, setElements] = useState<VSMElement[]>([]);
  const [konekcije, setKonekcije] = useState<VSMKonekcija[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number; moved: boolean } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; tip: string } | null>(null);
  const [konekcijaMode, setKonekcijaMode] = useState('material');
  const [showKonToolbar, setShowKonToolbar] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Proces: true, Materijal: true, Kanban: false, Ostalo: false });
  const [showTakt, setShowTakt] = useState(false);
  const [raspVrijeme, setRaspVrijeme] = useState('27600');
  const [potraznja, setPotraznja] = useState('500');
  const svgRef = useRef<SVGSVGElement>(null);

  const takt = (() => {
    const avail = parseFloat(raspVrijeme);
    const demand = parseFloat(potraznja);
    if (!avail || !demand) return null;
    return +(avail / demand).toFixed(1);
  })();

  useEffect(() => {
    requireAuth(router).then(user => {
      if (!user) return;
      setUser(user);
    });
  }, [router]);

  const addElement = (type: ElementType) => {
    const def = ELEMENT_DEFS[type];
    const el: VSMElement = {
      id: genId(), type,
      x: 80 + Math.random() * 300, y: 80 + Math.random() * 200,
      naziv: def.label,
      podaci: Object.fromEntries(def.fields.map(f => [f, ''])),
    };
    setElements(prev => [...prev, el]);
    setSelected(el.id);
  };

  const getSVGPos = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (connecting) {
      if (connecting.fromId !== id) {
        setKonekcije(prev => [...prev, { id: genId(), fromId: connecting.fromId, toId: id, tip: connecting.tip as any }]);
      }
      setConnecting(null);
      return;
    }
    const el = elements.find(el => el.id === id)!;
    const pos = getSVGPos(e);
    setDragging({ id, offX: pos.x - el.x, offY: pos.y - el.y, moved: false });
  };

  const onElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!dragging?.moved) setSelected(id);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = getSVGPos(e);
    setDragging(prev => prev ? { ...prev, moved: true } : null);
    setElements(prev => prev.map(el =>
      el.id === dragging.id ? { ...el, x: Math.max(0, pos.x - dragging.offX), y: Math.max(0, pos.y - dragging.offY) } : el
    ));
  };

  const onMouseUp = () => setDragging(null);
  const onSVGClick = () => { if (!connecting) setSelected(null); };

  const deleteSelected = () => {
    if (!selected) return;
    setElements(prev => prev.filter(e => e.id !== selected));
    setKonekcije(prev => prev.filter(k => k.fromId !== selected && k.toId !== selected));
    setSelected(null);
  };

  const updatePodatak = (field: string, value: string) => {
    if (!selected) return;
    setElements(prev => prev.map(el => el.id === selected ? { ...el, podaci: { ...el.podaci, [field]: value } } : el));
  };

  const updateNazivEl = (value: string) => {
    if (!selected) return;
    setElements(prev => prev.map(el => el.id === selected ? { ...el, naziv: value } : el));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('vsm_dijagram').insert({ user_id: user.id, naziv, elementi: elements, konekcije });
    setSaving(false);
    if (!error) setSaved(true);
  };

  const exportPNG = () => {
    const svg = svgRef.current;
    if (!svg || elements.length === 0) { alert('Dodajte barem jedan element prije izvoza.'); return; }

    const PAD = 40;
    const minX = Math.min(...elements.map(e => e.x)) - PAD;
    const minY = Math.min(...elements.map(e => e.y)) - PAD;
    const maxX = Math.max(...elements.map(e => e.x + ELEMENT_DEFS[e.type].w)) + PAD;
    const maxY = Math.max(...elements.map(e => e.y + ELEMENT_DEFS[e.type].h)) + PAD;
    const w = maxX - minX;
    const h = maxY - minY;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    clone.setAttribute('viewBox', `${minX} ${minY} ${w} ${h}`);
    clone.removeAttribute('style');

    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', String(minX));
    bgRect.setAttribute('y', String(minY));
    bgRect.setAttribute('width', String(w));
    bgRect.setAttribute('height', String(h));
    bgRect.setAttribute('fill', '#fafaf8');
    clone.insertBefore(bgRect, clone.firstChild);

    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if (!blob) return;
          const link = document.createElement('a');
          link.download = `VSM-${naziv.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const selectedEl = elements.find(e => e.id === selected);
  const selectedDef = selectedEl ? ELEMENT_DEFS[selectedEl.type] : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-4 flex items-center gap-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full shrink-0">🗺️ VSM Builder</div>
        <input type="text" className="font-serif text-xl text-[#1a1a1a] bg-transparent border-none outline-none flex-1 min-w-0" value={naziv} onChange={e => setNaziv(e.target.value)}/>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#1a7a5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155f49] transition-all disabled:opacity-70">
            {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
            {saving ? 'Spremam...' : 'Spremi'}
          </button>
          {saved && <span className="text-sm text-[#1a7a5e] font-semibold self-center">✅</span>}
          <button onClick={exportPNG}
            className="flex items-center gap-2 border border-[#e2e2e2] text-[#5a5a5a] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-all">
            <ImageIcon size={16}/> Preuzmi PNG
          </button>
          <button onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 border border-[#e2e2e2] text-[#5a5a5a] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-all">
            <HelpCircle size={16}/> Upute
          </button>
          <a href="/alati/vodici/vsm" target="_blank"
            className="flex items-center gap-2 border border-[#e2e2e2] text-[#5a5a5a] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-700 transition-all">
            <BookOpen size={16}/> Vodič
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>

        {/* Lijeva paleta */}
        <div className="w-52 bg-white border-r border-[#e2e2e2] flex flex-col overflow-y-auto shrink-0">
          <div className="p-3 space-y-1">
            {ELEMENT_GROUPS.map(group => (
              <div key={group}>
                <button onClick={() => setOpenGroups(p => ({ ...p, [group]: !p[group] }))}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-[#9a9a9a] uppercase tracking-wider hover:text-[#1a1a1a] transition-colors">
                  {group}
                  {openGroups[group] ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                </button>
                {openGroups[group] && (
                  <div className="space-y-0.5 mb-2">
                    {(Object.entries(ELEMENT_DEFS) as [ElementType, typeof ELEMENT_DEFS[ElementType]][])
                      .filter(([, def]) => def.group === group)
                      .map(([type, def]) => (
                        <button key={type} onClick={() => addElement(type)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left hover:bg-[#e8f5f0] hover:text-[#1a7a5e] transition-all">
                          <span className="text-sm">{def.emoji}</span>
                          <span className="text-xs font-medium truncate">{def.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-[#e2e2e2] pt-2">
              <button onClick={() => setShowTakt(!showTakt)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-[#9a9a9a] uppercase tracking-wider hover:text-[#1a1a1a]">
                ⏱️ Takt vrijeme {showTakt ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
              </button>
              {showTakt && (
                <div className="px-2 py-2 space-y-2">
                  <div>
                    <label className="block text-[10px] font-medium text-[#5a5a5a] mb-1">Raspoloživo vrijeme (sek/smjena)</label>
                    <input type="number" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={raspVrijeme} onChange={e => setRaspVrijeme(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#5a5a5a] mb-1">Dnevna potražnja (kom/dan)</label>
                    <input type="number" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-xs focus:border-[#1a7a5e] outline-none bg-[#fafaf8]" value={potraznja} onChange={e => setPotraznja(e.target.value)} />
                  </div>
                  <div className="takt-out">{takt !== null ? `Takt: ${takt} sek/kom` : 'Takt: —'}</div>
                </div>
              )}
            </div>

            <div className="border-t border-[#e2e2e2] pt-2">
              <button onClick={() => setShowKonToolbar(!showKonToolbar)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-[#9a9a9a] uppercase tracking-wider hover:text-[#1a1a1a]">
                Konekcije {showKonToolbar ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
              </button>
              {showKonToolbar && (
                <div className="space-y-0.5 mt-1">
                  {KONEKCIJA_OPCIJE.map(opt => (
                    <button key={opt.tip} onClick={() => setKonekcijaMode(opt.tip)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${konekcijaMode === opt.tip ? 'bg-[#e8f5f0] text-[#1a7a5e] font-bold' : 'hover:bg-[#fafaf8]'}`}>
                      <span style={{ color: opt.color, fontSize: 14 }}>→</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {connecting && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-700 text-center mt-2">
                Klikni ciljni element
                <button onClick={() => setConnecting(null)} className="block w-full mt-1 text-red-500 hover:underline text-xs">Odustani</button>
              </div>
            )}

            {selected && !connecting && (
              <div className="border-t border-[#e2e2e2] mt-2 pt-2 space-y-1">
                <button onClick={() => setConnecting({ fromId: selected, tip: konekcijaMode })}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                  <Plus size={12}/> Poveži element
                </button>
                <button onClick={deleteSelected}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                  <Trash2 size={12}/> Obriši element
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <svg ref={svgRef} width={1800} height={1000}
            className="cursor-default select-none"
            style={{ backgroundImage: 'radial-gradient(#e2e2e2 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundColor: '#fafaf8' }}
            onMouseMove={onMouseMove} onMouseUp={onMouseUp} onClick={onSVGClick}>

            {konekcije.map(k => <KonekcijaLine key={k.id} from={k.fromId} to={k.toId} tip={k.tip} elements={elements}/>)}

            {elements.map(el => {
              const def = ELEMENT_DEFS[el.type];
              const isSel = selected === el.id;
              return (
                <g key={el.id} transform={`translate(${el.x},${el.y})`}
                  onMouseDown={e => onElementMouseDown(e, el.id)}
                  onClick={e => onElementClick(e, el.id)}
                  style={{ cursor: connecting ? 'crosshair' : 'grab' }}>
                  {isSel && <rect x={-4} y={-4} width={def.w+8} height={def.h+8} rx={6} fill="none" stroke="#1a7a5e" strokeWidth={2} strokeDasharray="4,2"/>}
                  <ElementShape type={el.type} w={def.w} h={def.h} naziv={el.naziv}/>
                </g>
              );
            })}

            {elements.length === 0 && (
              <g>
                <text x={900} y={420} textAnchor="middle" fontSize={56} opacity={0.12}>🗺️</text>
                <text x={900} y={480} textAnchor="middle" fontSize={16} fill="#9a9a9a">Dodajte elemente iz lijeve palete</text>
                <text x={900} y={505} textAnchor="middle" fontSize={13} fill="#c0c0c0">Klikni element → povuci → uredi podatke desno</text>
              </g>
            )}
          </svg>
        </div>

        {/* Desni panel */}
        {selectedEl && selectedDef && (
          <div className="w-64 bg-white border-l border-[#e2e2e2] p-4 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">⚙️ Svojstva</h3>
              <button onClick={() => setSelected(null)} className="text-[#9a9a9a] hover:text-[#1a1a1a]"><X size={16}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#5a5a5a] mb-1">Naziv</label>
                <input type="text" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
                  value={selectedEl.naziv} onChange={e => updateNazivEl(e.target.value)}/>
              </div>
              {selectedDef.fields.map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[#5a5a5a] mb-1">{field}</label>
                  <input type="text" className="w-full px-2 py-1.5 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
                    value={selectedEl.podaci[field] || ''} onChange={e => updatePodatak(field, e.target.value)} placeholder={`Unesite ${field.toLowerCase()}...`}/>
                </div>
              ))}
              <div className="pt-2 border-t border-[#e2e2e2] space-y-2">
                <p className="text-xs text-[#9a9a9a]">Tip: <strong>{selectedDef.label}</strong></p>
                <button onClick={() => setConnecting({ fromId: selectedEl.id, tip: konekcijaMode })}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-all">
                  <Plus size={12}/> Poveži s elementom
                </button>
                <button onClick={deleteSelected}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all">
                  <Trash2 size={12}/> Obriši
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="bg-white border-t border-[#e2e2e2] px-6 py-2 flex items-center gap-4 text-xs text-[#9a9a9a] flex-wrap">
        {KONEKCIJA_OPCIJE.map(opt => (
          <span key={opt.tip} className="flex items-center gap-1">
            <svg width={20} height={10}>
              <line x1={0} y1={5} x2={16} y2={5} stroke={opt.color} strokeWidth={1.5} strokeDasharray={opt.dash}/>
              <polygon points="14,2 14,8 20,5" fill={opt.color}/>
            </svg>
            {opt.label}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-[#c0c0c0]">Klikni · Povuci · Poveži</span>
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e2e2] sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-[#1a1a1a]">🗺️ Upute za VSM Builder</h2>
              <button onClick={() => setShowHelp(false)} className="text-[#9a9a9a] hover:text-[#1a1a1a]"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">

              {/* Osnovne radnje */}
              <section>
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">⚡ Osnovne radnje</h3>
                <div className="space-y-2">
                  {[
                    { a: 'Dodaj element', o: 'Klikni na element u lijevoj paleti — pojavljuje se na canvasu' },
                    { a: 'Pomakni element', o: 'Klikni i povuci element po canvasu' },
                    { a: 'Odaberi element', o: 'Klikni na element — otvara se desni panel sa svojstvima' },
                    { a: 'Uredi podatke', o: 'U desnom panelu unesi naziv i podatke za odabrani element' },
                    { a: 'Poveži elemente', o: 'Odaberi element → klikni "Poveži element" → klikni na ciljni element' },
                    { a: 'Tip veze', o: 'U lijevoj paleti odaberi tip veze PRIJE klika na "Poveži element"' },
                    { a: 'Obriši element', o: 'Odaberi element → klikni "Obriši" u desnom panelu ili paleti' },
                    { a: 'Spremi dijagram', o: 'Klikni "Spremi" u gornjem desnom kutu — sprema u Supabase' },
                  ].map(r => (
                    <div key={r.a} className="flex gap-3 bg-[#fafaf8] rounded-lg p-3">
                      <span className="text-xs font-bold text-[#1a7a5e] shrink-0 w-32">{r.a}</span>
                      <span className="text-xs text-[#5a5a5a]">{r.o}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Simboli */}
              <section>
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">🔷 Simboli i što znače</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { s: '🏭', n: 'Dobavljač', o: 'Vanjski izvor materijala — lijevi kraj mape' },
                    { s: '👤', n: 'Kupac', o: 'Krajnji kupac — desni kraj mape' },
                    { s: '⬜', n: 'Proces', o: 'Korak koji transformira materijal (C/T, C/O, smjene...)' },
                    { s: '👷', n: 'Radnik', o: 'Broj operatera na procesu' },
                    { s: '📋', n: 'Planiranje', o: 'PPC/MRP — središte informacijskog toka' },
                    { s: '▲', n: 'Zaliha', o: 'WIP između procesa (količina, dani)' },
                    { s: '📦', n: 'Supermarket', o: 'Pull zalihe — povlačenje po potrebi' },
                    { s: '➡️', n: 'FIFO traka', o: 'Kontrolirani tok bez nakupljanja' },
                    { s: '🚚', n: 'Transport', o: 'Fizički prijevoz materijala' },
                    { s: '🎴', n: 'Prod. kanban', o: 'Signal za pokretanje proizvodnje' },
                    { s: '🔄', n: 'Pull kanban', o: 'Signal za povlačenje iz supermarketa' },
                    { s: '⚡', n: 'Kaizen blic', o: 'Označava prilike za poboljšanje' },
                    { s: '📏', n: 'Vremenka linija', o: 'VA/NVA segmenti na dnu mape' },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-2 bg-[#fafaf8] rounded-lg p-2">
                      <span className="text-lg shrink-0">{s.s}</span>
                      <div>
                        <p className="text-xs font-bold text-[#1a1a1a]">{s.n}</p>
                        <p className="text-[10px] text-[#9a9a9a]">{s.o}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tipovi veza */}
              <section>
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">🔗 Tipovi veza</h3>
                <div className="space-y-2">
                  {[
                    { t: '→ Materijalni tok', b: '#1a1a1a', o: 'Fizički tok materijala (crna puna strijela)' },
                    { t: '→ Push strijela', b: '#ca8a04', o: 'Guranje materijala bez pull signala (narančasta)' },
                    { t: '→ Pull (kanban)', b: '#dc2626', o: 'Povlačenje na temelju kanban signala (crvena isprekidana)' },
                    { t: '→ Informacijski tok', b: '#1a7a5e', o: 'Ručni tok informacija (zelena isprekidana)' },
                    { t: '⚡→ El. tok informacija', b: '#2563eb', o: 'ERP, email, EDI (plava sa ⚡)' },
                    { t: '→ Povratne informacije', b: '#7c3aed', o: 'Povratna veza u procesu (ljubičasta)' },
                  ].map(v => (
                    <div key={v.t} className="flex items-center gap-3 bg-[#fafaf8] rounded-lg p-3">
                      <div className="w-8 h-0.5 shrink-0" style={{backgroundColor: v.b}}></div>
                      <div>
                        <p className="text-xs font-bold" style={{color: v.b}}>{v.t}</p>
                        <p className="text-[10px] text-[#9a9a9a]">{v.o}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Savjeti */}
              <section>
                <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">💡 Savjeti za crtanje</h3>
                <div className="space-y-2">
                  {[
                    'Počnite s Dobavljačem (lijevo) i Kupcem (desno)',
                    'Procese dodajte s lijeva na desno — redoslijedom toka materijala',
                    'Između procesa dodajte Zalihe (trokut) gdje se materijal nakuplja',
                    'Informacijski tok crtajte odozgo — od Kupca prema Planiranju prema Procesima',
                    'Kaizen bliceve dodajte na mjesta gdje vidite prilike za poboljšanje',
                    'Vremensku liniju dodajte na dno — prikazuje VA vs NVA segmente',
                    'Redovito spremajte — klik na "Spremi" u gornjem desnom kutu',
                  ].map((s, i) => (
                    <p key={i} className="text-xs text-[#5a5a5a] flex gap-2 bg-[#e8f5f0] rounded-lg p-2">
                      <span className="text-[#1a7a5e] font-bold shrink-0">{i+1}.</span>{s}
                    </p>
                  ))}
                </div>
              </section>

              <div className="text-center pt-2">
                <a href="/alati/vodici/vsm" target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
                  <BookOpen size={14}/> Pročitaj kompletan VSM vodič →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
