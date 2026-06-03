"use client";

import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Info, Loader2, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const auditData = [
  {
    id: 's1',
    title: 'Sortiranje (Seiri) — Ukloni nepotrebno',
    description: 'Identificirati i ukloniti sve nepotrebne predmete s radnog mjesta',
    criteria: [
      { id: 's1_1', text: 'Nepotrebni materijali i alati su uklonjeni', note: 'Nema nepotrebnih predmeta na radnoj površini ili u blizini' },
      { id: 's1_2', text: 'Nepotrebna oprema i strojevi su označeni ili premješteni', note: 'Crvene kartice (red tags) koriste se za označavanje' },
      { id: 's1_3', text: 'Nema viška zaliha ili materijala koji blokiraju prolaz', note: 'Prolazi su slobodni i označeni' },
      { id: 's1_4', text: 'Dokumenti i obrasci — samo aktualni su na radnom mjestu', note: 'Zastarjeli dokumenti su arhivirani ili uništeni' },
      { id: 's1_5', text: 'Osobni predmeti radnika ne ometaju radni proces', note: 'Postoje označena mjesta za osobne stvari' },
    ]
  },
  {
    id: 's2',
    title: 'Sređivanje (Seiton) — Mjesto za sve, sve na svom mjestu',
    description: 'Organizirati i označiti sve predmete tako da ih je lako pronaći i vratiti',
    criteria: [
      { id: 's2_1', text: 'Svaki alat i predmet ima točno određeno i označeno mjesto', note: 'Vizualne oznake, konture, oznake boja' },
      { id: 's2_2', text: 'Oznake na podu razgraničavaju radna područja, prolaze i zone skladištenja', note: 'Linije su vidljive i neoštećene' },
      { id: 's2_3', text: 'Alati i materijali su dostupni na točci upotrebe (point of use)', note: 'Minimalno pomicanje radnika za dohvat alata' },
      { id: 's2_4', text: 'Vizualni management je implementiran (što, gdje, koliko)', note: 'Oznake razina min/max, naljepi, kanban kartice' },
      { id: 's2_5', text: 'Sve police i ormarići su označeni i uredno složeni', note: 'Sadržaj je vidljiv ili jasno označen izvana' },
    ]
  },
  {
    id: 's3',
    title: 'Čišćenje (Seiso) — Održavaj čistoću',
    description: 'Redovito čišćenje i inspekcija radnog mjesta i opreme',
    criteria: [
      { id: 's3_1', text: 'Pod, radne površine i oprema su čisti i bez prljavštine', note: 'Nema ulja, prašine, otpadaka na vidljivim mjestima' },
      { id: 's3_2', text: 'Plan čišćenja postoji i provodi se redovito', note: 'Raspored čišćenja je vidljiv i potpisan' },
      { id: 's3_3', text: 'Strojevi i oprema se čiste kao dio rutinskog održavanja', note: 'Čišćenje = inspekcija (TPM princip)' },
      { id: 's3_4', text: 'Izvori prljavštine su identificirani i sanirani ili označeni', note: 'Curi ulje, prašina od brušenja i sl. su pod kontrolom' },
      { id: 's3_5', text: 'Alati za čišćenje su dostupni, označeni i na svom mjestu', note: 'Metla, lopatica, krpe i sl. imaju određeno mjesto' },
    ]
  },
  {
    id: 's4',
    title: 'Standardizacija (Seiketsu) — Standardiziraj i vizualiziraj',
    description: 'Uspostaviti standarde koji osiguravaju trajno provođenje S1, S2 i S3',
    criteria: [
      { id: 's4_1', text: '5S standardi su dokumentirani i vidljivi na radnom mjestu', note: 'Fotografije "idealnog stanja" su istaknute' },
      { id: 's4_2', text: 'Odgovornosti za 5S aktivnosti su jasno dodijeljene', note: 'Svaki radnik zna što je njegova odgovornost' },
      { id: 's4_3', text: 'Vizualni standardi (boje, oznake) su konzistentni u cijelom pogonu', note: 'Isti sustav boja i oznaka u svim zonama' },
      { id: 's4_4', text: 'Rezultati prethodnih audita su vidljivi i prate se trendovi', note: 'Graf rezultata audita je istaknut' },
      { id: 's4_5', text: 'Novi radnici dobivaju 5S obuku kao dio uvođenja', note: 'Postoji standardizirani onboarding za 5S' },
    ]
  },
  {
    id: 's5',
    title: 'Samodisciplina (Shitsuke) — Održavaj i poboljšavaj',
    description: 'Kultura kontinuiranog poboljšanja i poštivanja standarda',
    criteria: [
      { id: 's5_1', text: 'Radnici poštuju 5S standarde bez podsjetnika', note: '5S je dio svakodnevne rutine, ne posebne aktivnosti' },
      { id: 's5_2', text: '5S audit se provodi redovito prema rasporedu', note: 'Minimalno jednom mjesečno, rezultati se bilježe' },
      { id: 's5_3', text: 'Prijedlozi poboljšanja od radnika se aktivno prikupljaju', note: 'Postoji sustav za Kaizen prijedloge' },
      { id: 's5_4', text: 'Menadžment aktivno sudjeluje i podržava 5S aktivnosti', note: 'Voditelji su vidljivi i daju primjer' },
      { id: 's5_5', text: 'Postignuća i napredak se slave i komuniciraju timu', note: 'Vizualni prikaz napretka, zahvale, nagrade' },
    ]
  }
];

export default function Smart5SAudit() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [meta, setMeta] = useState({ 
    firma: '', 
    osoba: '', 
    datum: new Date().toISOString().split('T')[0], 
    lokacija: '',
    smjena: '',
    broj: ''
  });
  const [obs, setObs] = useState({
    pozitivno: '',
    poboljsanje: '',
    akcije: '',
    sljedeci: '',
    potpis: ''
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleRate = (id: string, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const toggleComment = (id: string) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateSectionScore = (sectionId: string) => {
    const section = auditData.find(s => s.id === sectionId);
    return section?.criteria.reduce((acc, c) => acc + (scores[c.id] || 0), 0) || 0;
  };

  const totalScore = auditData.reduce((acc, s) => acc + calculateSectionScore(s.id), 0);
  
  const getScoreColor = (pct: number) => {
    if (pct >= 80) return { bg: '#dcfce7', color: '#16a34a' };
    if (pct >= 60) return { bg: '#fef9c3', color: '#ca8a04' };
    if (pct >= 40) return { bg: '#ffedd5', color: '#ea580c' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };

  const colors = getScoreColor(totalScore);

  const saveToPortal = async () => {
    if (!user) {
      alert('Morate biti prijavljeni kako biste spremili audit u portal.');
      router.push('/prijava');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const { error } = await supabase
        .from('audits_5s')
        .insert([
          {
            user_id: user.id,
            firma: meta.firma,
            osoba: meta.osoba,
            datum: meta.datum,
            lokacija: meta.lokacija,
            smjena: meta.smjena,
            broj: meta.broj,
            scores: scores,
            comments: comments,
            total_score: totalScore,
            observations: obs
          }
        ]);

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving:', err);
      alert('Greška: ' + (err.message || 'Nepoznata greška pri spremanju.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="tool-badge">📋 Pametni alat</div>
          <h1>5S Audit Obrazac</h1>
          <p>Digitalni sustav za provođenje i spremanje 5S audita. Ispunite obrazac, automatski se računa rezultat, a zatim ga spremite u svoj profil.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-inner">
          <button onClick={() => window.location.reload()} className="btn btn-outline">🔄 Resetiraj</button>
          <button className="btn btn-outline" onClick={() => window.print()}>🖨️ Ispis</button>
          
          <button 
            className={`btn ${saveSuccess ? 'bg-green-600 text-white' : 'btn-primary'}`} 
            onClick={saveToPortal}
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="animate-spin" size={16} /> Spremanje...</>
            ) : saveSuccess ? (
              <><CheckCircle2 size={16} /> Spremljeno!</>
            ) : (
              <><Save size={16} /> Spremi u Portal</>
            )}
          </button>

          <div className="score-display">
            <span className="score-label">Ukupni rezultat:</span>
            <span className="score-pill" style={{ background: colors.bg, color: colors.color }}>
              {totalScore} / 100
            </span>
          </div>
        </div>
      </div>

      <div className="form-wrap">
        {!user && (
          <div className="bg-[#fff5f5] border border-[#feb2b2] p-4 rounded-xl flex gap-3 text-sm text-[#c53030] mb-8">
            <Info size={20} className="shrink-0" />
            <p>Trenutno niste prijavljeni. Možete ispuniti audit, ali nećete ga moći spremiti u svoju povijest dok se ne <a href="/prijava" className="font-bold underline">prijavite</a>.</p>
          </div>
        )}

        {/* META INFO */}
        <div className="meta-section">
          <h3>Podaci o auditu</h3>
          <div className="meta-grid">
            <div className="field">
              <label>Naziv firme / pogona</label>
              <input type="text" value={meta.firma} onChange={e => setMeta({...meta, firma: e.target.value})} placeholder="npr. OptiCora d.o.o. — Pogon 1" />
            </div>
            <div className="field">
              <label>Odgovorna osoba</label>
              <input type="text" value={meta.osoba} onChange={e => setMeta({...meta, osoba: e.target.value})} placeholder="Ime i prezime auditora" />
            </div>
            <div className="field">
              <label>Datum audita</label>
              <input type="date" value={meta.datum} onChange={e => setMeta({...meta, datum: e.target.value})} />
            </div>
            <div className="field">
              <label>Lokacija / radno mjesto</label>
              <input type="text" value={meta.lokacija} onChange={e => setMeta({...meta, lokacija: e.target.value})} placeholder="npr. Montažna linija A" />
            </div>
            <div className="field">
              <label>Smjena</label>
              <select value={meta.smjena} onChange={e => setMeta({...meta, smjena: e.target.value})}>
                <option value="">— odaberi —</option>
                <option>Prva smjena (06-14h)</option>
                <option>Druga smjena (14-22h)</option>
                <option>Treća smjena (22-06h)</option>
                <option>Jednokratni audit</option>
              </select>
            </div>
            <div className="field">
              <label>Broj audita</label>
              <input type="text" value={meta.broj} onChange={e => setMeta({...meta, broj: e.target.value})} placeholder="npr. 2024-001" />
            </div>
          </div>
        </div>

        {/* LEGEND */}
        <div className="legend">
          <span style={{fontSize:'11px',fontWeight:500,color:'var(--text-muted)',marginRight:'4px'}}>Ocjena:</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#ef4444'}}></span> 0 — Ne postoji</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#f97316'}}></span> 1 — Loše</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#eab308'}}></span> 2 — Zadovoljava</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#22c55e'}}></span> 3 — Dobro</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#16a34a'}}></span> 4 — Izvrsno</span>
        </div>

        {auditData.map(section => (
          <div key={section.id} className="audit-section">
            <div className="audit-section-header">
              <div className={`s-number ${section.id}`}>{section.id.toUpperCase()}</div>
              <div className="section-title-block">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <span className="section-score-badge" style={{background: getScoreColor((calculateSectionScore(section.id)/20)*100).bg, color: getScoreColor((calculateSectionScore(section.id)/20)*100).color}}>
                {calculateSectionScore(section.id)} / 20
              </span>
            </div>
            <table className="criteria-table">
              <thead>
                <tr>
                  <th style={{width:'40%'}}>Kriterij</th>
                  <th style={{width:'30%'}}>Napomena / opis</th>
                  <th style={{width:'30%', textAlign:'center'}}>Ocjena (0–4)</th>
                </tr>
              </thead>
              <tbody>
                {section.criteria.map(c => (
                  <tr key={c.id} className="criteria-row">
                    <td>
                      <div className="criteria-text">{c.text}</div>
                      <div className="criteria-note">{c.note}</div>
                    </td>
                    <td>
                      <button className="comment-btn" onClick={() => toggleComment(c.id)}>
                        {openComments[c.id] ? '− sakrij komentar' : '+ dodaj komentar'}
                      </button>
                      <div className={`inline-comment ${openComments[c.id] ? 'show' : ''}`}>
                        <input 
                          type="text" 
                          placeholder="Komentar..." 
                          value={comments[c.id] || ''} 
                          onChange={e => setComments({...comments, [c.id]: e.target.value})}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="rating-group">
                        {[0,1,2,3,4].map(v => (
                          <button
                            key={v}
                            className={`rating-btn ${scores[c.id] === v ? `selected-${v}` : ''}`}
                            onClick={() => handleRate(c.id, v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* SUMMARY BARS */}
        <div className="summary-section">
          <h3>📊 Rezultati audita</h3>
          <div className="summary-bars">
            {auditData.map(s => {
              const sc = calculateSectionScore(s.id);
              const pct = (sc / 20) * 100;
              const color = s.id === 's1' ? '#3b82f6' : s.id === 's2' ? '#8b5cf6' : s.id === 's3' ? '#f59e0b' : s.id === 's4' ? '#10b981' : '#ef4444';
              return (
                <div key={s.id} className="summary-bar-row">
                  <span className="summary-bar-label" style={{color}}>{s.id.toUpperCase()}</span>
                  <div className="summary-bar-track">
                    <div className="summary-bar-fill" style={{width: `${pct}%`, background: color}}></div>
                  </div>
                  <span className="summary-bar-val">{sc}/20</span>
                </div>
              );
            })}
          </div>
          <div className="total-score-display" style={{background: colors.bg}}>
            <div>
              <div style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'4px'}}>Ukupni rezultat</div>
              <div className="big-score" style={{color: colors.color}}>{totalScore} / 100</div>
            </div>
            <div className="score-info">
              <div className="score-grade" style={{color: colors.color}}>
                {totalScore >= 90 ? 'A — Izvrsno ⭐' : totalScore >= 80 ? 'B — Dobro 👍' : totalScore >= 60 ? 'C — Zadovoljavajuće ⚠️' : 'D — Potrebno poboljšanje 🚨'}
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVATIONS */}
        <div className="audit-section" style={{padding:'20px'}}>
          <h3 style={{fontSize:'14px',fontWeight:600,marginBottom:'14px',paddingBottom:'10px',borderBottom:'1px solid var(--border)'}}>📝 Zapažanja i akcijski plan</h3>
          <div className="obs-grid">
            <div className="obs-field">
              <label>Pozitivna zapažanja (što je dobro)</label>
              <textarea value={obs.pozitivno} onChange={e => setObs({...obs, pozitivno: e.target.value})} placeholder="Npr. Svi prolazi su jasno označeni..."></textarea>
            </div>
            <div className="obs-field">
              <label>Područja za poboljšanje</label>
              <textarea value={obs.poboljsanje} onChange={e => setObs({...obs, poboljsanje: e.target.value})} placeholder="Npr. Alati se ne vraćaju na mjesto..."></textarea>
            </div>
            <div className="obs-field">
              <label>Prioritetne akcije</label>
              <textarea value={obs.akcije} onChange={e => setObs({...obs, akcije: e.target.value})} placeholder="Npr. 1. Označiti alate bojom..."></textarea>
            </div>
            <div className="obs-field">
              <label>Datum sljedećeg audita</label>
              <input type="date" value={obs.sljedeci} onChange={e => setObs({...obs, sljedeci: e.target.value})} />
              <label style={{marginTop:'10px'}}>Potpis auditora</label>
              <input type="text" value={obs.potpis} onChange={e => setObs({...obs, potpis: e.target.value})} placeholder="Ime i prezime" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
