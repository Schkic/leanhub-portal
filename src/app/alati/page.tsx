"use client";

import React, { useState } from 'react';

const ALATI = [
  {
    href: '/alati/5s-audit',
    vodic: '/alati/vodici/5s',
    icon: '📋',
    naziv: '5S Audit',
    opis: 'Strukturirana provjera čistoće, organizacije i discipline na radnom mjestu.',
    kategorija: 'Organizacija',
    trajanje: '30–60 min',
    razina: 'Početna',
    headerBg: 'bg-[#e8f5f0]',
    headerText: 'text-[#1a7a5e]',
    border: 'border-[#1a7a5e]',
    btnBg: 'bg-[#1a7a5e] hover:bg-[#155f49]',
    vodicBg: 'border-[#1a7a5e] text-[#1a7a5e] hover:bg-[#e8f5f0]',
  },
  {
    href: '/alati/gemba-walk',
    vodic: '/alati/vodici/gemba-walk',
    icon: '🚶',
    naziv: 'Gemba Walk',
    opis: 'Strukturirani obilazak radnog mjesta radi uočavanja gubitaka i prilika za poboljšanje.',
    kategorija: 'Dijagnostika',
    trajanje: '60–120 min',
    razina: 'Srednja',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
    border: 'border-blue-300',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    vodicBg: 'border-blue-400 text-blue-600 hover:bg-blue-50',
  },
  {
    href: '/alati/a3-obrazac',
    vodic: '/alati/vodici/a3',
    icon: '📄',
    naziv: 'A3 Obrazac',
    opis: 'Toyotin strukturirani pristup rješavanju problema — od opisa do standardizacije.',
    kategorija: 'Rješavanje problema',
    trajanje: '1–4 sata',
    razina: 'Napredna',
    headerBg: 'bg-orange-50',
    headerText: 'text-orange-700',
    border: 'border-orange-300',
    btnBg: 'bg-orange-600 hover:bg-orange-700',
    vodicBg: 'border-orange-400 text-orange-600 hover:bg-orange-50',
  },
  {
    href: '/alati/5-zasto',
    vodic: '/alati/vodici/5-zasto',
    icon: '❓',
    naziv: '5x Zašto',
    opis: 'Jednostavna tehnika pronalaska korijenskog uzroka postavljanjem pet uzastopnih pitanja.',
    kategorija: 'Analiza uzroka',
    trajanje: '30–90 min',
    razina: 'Početna',
    headerBg: 'bg-red-50',
    headerText: 'text-red-700',
    border: 'border-red-300',
    btnBg: 'bg-red-600 hover:bg-red-700',
    vodicBg: 'border-red-400 text-red-600 hover:bg-red-50',
  },
  {
    href: '/alati/oee-kalkulator',
    vodic: '/alati/vodici/oee',
    icon: '📊',
    naziv: 'OEE Kalkulator',
    opis: 'Izračun ukupne učinkovitosti opreme — Dostupnost, Performansa i Kvaliteta.',
    kategorija: 'Mjerenje',
    trajanje: '15–30 min',
    razina: 'Srednja',
    headerBg: 'bg-purple-50',
    headerText: 'text-purple-700',
    border: 'border-purple-300',
    btnBg: 'bg-purple-600 hover:bg-purple-700',
    vodicBg: 'border-purple-400 text-purple-600 hover:bg-purple-50',
  },
  {
    href: '/alati/kaizen-prijedlog',
    vodic: '/alati/vodici/kaizen',
    icon: '♾️',
    naziv: 'Kaizen Prijedlog',
    opis: 'Obrazac za prijedloge poboljšanja — svaki zaposlenik može predložiti promjenu.',
    kategorija: 'Kontinuirano poboljšanje',
    trajanje: '10–20 min',
    razina: 'Početna',
    headerBg: 'bg-teal-50',
    headerText: 'text-teal-700',
    border: 'border-teal-300',
    btnBg: 'bg-teal-600 hover:bg-teal-700',
    vodicBg: 'border-teal-400 text-teal-600 hover:bg-teal-50',
  },
  {
    href: '/alati/vsm-builder',
    vodic: null,
    icon: '🗺️',
    naziv: 'VSM Builder',
    opis: 'Vizualno mapiranje toka vrijednosti — identificirajte gubitke u cijelom procesu.',
    kategorija: 'Mapiranje',
    trajanje: '2–4 sata',
    razina: 'Napredna',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-800',
    border: 'border-blue-400',
    btnBg: 'bg-blue-700 hover:bg-blue-800',
    vodicBg: '',
  },
  {
    href: '/alati/ishikawa',
    vodic: null,
    icon: '🐟',
    naziv: 'Ishikawa Dijagram',
    opis: 'Dijagram riblje kosti — vizualna analiza uzroka problema metodom 6M.',
    kategorija: 'Analiza uzroka',
    trajanje: '45–90 min',
    razina: 'Srednja',
    headerBg: 'bg-rose-50',
    headerText: 'text-rose-700',
    border: 'border-rose-300',
    btnBg: 'bg-rose-600 hover:bg-rose-700',
    vodicBg: '',
  },
  {
    href: '/alati/smed',
    vodic: null,
    icon: '⚡',
    naziv: 'SMED Analiza',
    opis: 'Single Minute Exchange of Die — smanjite izmjensko vrijeme pretvaranjem internih u eksterne aktivnosti.',
    kategorija: 'Fleksibilnost',
    trajanje: '1–3 sata',
    razina: 'Napredna',
    headerBg: 'bg-yellow-50',
    headerText: 'text-yellow-700',
    border: 'border-yellow-300',
    btnBg: 'bg-yellow-500 hover:bg-yellow-600',
    vodicBg: '',
  },
];

const KATEGORIJE = ['Sve', 'Organizacija', 'Dijagnostika', 'Rješavanje problema', 'Analiza uzroka', 'Mjerenje', 'Kontinuirano poboljšanje', 'Mapiranje', 'Fleksibilnost'];
const RAZINE = ['Sve razine', 'Početna', 'Srednja', 'Napredna'];

const RAZINA_COLOR: Record<string, string> = {
  'Početna': 'text-green-700 bg-green-50',
  'Srednja': 'text-yellow-700 bg-yellow-50',
  'Napredna': 'text-red-700 bg-red-50',
};

export default function AlatiPage() {
  const [filterKat, setFilterKat] = useState('Sve');
  const [filterRaz, setFilterRaz] = useState('Sve razine');
  const [search, setSearch] = useState('');

  const filtered = ALATI.filter(a => {
    const matchKat = filterKat === 'Sve' || a.kategorija === filterKat;
    const matchRaz = filterRaz === 'Sve razine' || a.razina === filterRaz;
    const matchSearch = a.naziv.toLowerCase().includes(search.toLowerCase()) ||
      a.opis.toLowerCase().includes(search.toLowerCase());
    return matchKat && matchRaz && matchSearch;
  });

  return (
    <div className="bg-[#fafaf8] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e2e2e2] px-6 py-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a7a5e] bg-[#e8f5f0] px-3 py-1 rounded-full mb-4">🛠️ Lean Alati</div>
          <h1 className="font-serif text-4xl text-[#1a1a1a] mb-3">Svi Lean alati</h1>
          <p className="text-[#5a5a5a] text-base max-w-[600px]">
            Digitalni obrasci i kalkulatori za implementaciju Lean metodologije. Svaki alat s vodičem koji objašnjava kada i kako ga koristiti.
          </p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-6">
        {/* Filteri */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="🔍 Pretraži alate..."
            className="w-full px-4 py-2.5 border border-[#e2e2e2] rounded-lg text-sm focus:border-[#1a7a5e] outline-none bg-[#fafaf8]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {KATEGORIJE.map(k => (
              <button key={k} onClick={() => setFilterKat(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${filterKat === k ? 'bg-[#1a7a5e] text-white border-[#1a7a5e]' : 'bg-[#fafaf8] text-[#5a5a5a] border-[#e2e2e2] hover:bg-[#e8f5f0] hover:text-[#1a7a5e] hover:border-[#1a7a5e]'}`}>
                {k}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {RAZINE.map(r => (
              <button key={r} onClick={() => setFilterRaz(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${filterRaz === r ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-[#fafaf8] text-[#5a5a5a] border-[#e2e2e2] hover:bg-[#f0f0f0]'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#9a9a9a] mb-4">{filtered.length} od {ALATI.length} alata</p>

        {/* Alati grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(alat => (
            <div key={alat.href} className={`bg-white border-2 ${alat.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col`}>
              {/* Header */}
              <div className={`${alat.headerBg} px-5 py-4 flex items-center gap-3`}>
                <div className="text-3xl">{alat.icon}</div>
                <div>
                  <h3 className={`text-base font-bold ${alat.headerText}`}>{alat.naziv}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#9a9a9a] font-medium">{alat.kategorija}</span>
                    <span className="text-[#d0d0d0]">·</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${RAZINA_COLOR[alat.razina]}`}>{alat.razina}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4 flex flex-col flex-1">
                <p className="text-sm text-[#5a5a5a] leading-relaxed mb-3 flex-1">{alat.opis}</p>
                <div className="flex items-center gap-2 text-xs text-[#9a9a9a] mb-4">
                  <span>⏱️ {alat.trajanje}</span>
                </div>
                <div className="flex gap-2">
                  <a href={alat.href}
                    className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white transition-all ${alat.btnBg}`}>
                    Pokreni alat →
                  </a>
                  {alat.vodic && (
                    <a href={alat.vodic}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${alat.vodicBg}`}>
                      📖
                    </a>
                  )}
                </div>
                {alat.vodic && (
                  <a href={alat.vodic} className="text-center text-xs text-[#9a9a9a] hover:text-[#1a7a5e] mt-2 transition-colors">
                    Pročitaj vodič →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Nema rezultata</h3>
            <p className="text-[#5a5a5a] text-sm">Pokušajte s drugačijim filterima ili pretragom.</p>
          </div>
        )}
      </div>
    </div>
  );
}
