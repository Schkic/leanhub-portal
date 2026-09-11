// OEE kalkulacija — zajednička logika za dashboard i izvještaje.
export const calcStrojAvg = (strojevi: any[]): number => {
  if (!Array.isArray(strojevi)) return 0;
  const results = strojevi.map(stroj => {
    if (!Array.isArray(stroj.smjene)) return 0;
    const smjeneOEE = stroj.smjene.map((s: any) => {
      const op = s.planirano - s.zastoji;
      if (s.planirano <= 0 || op <= 0 || s.idealniTakt <= 0) return 0;
      const A = Math.min((op / s.planirano) * 100, 100);
      const P = Math.min(s.idealniTakt > 0 ? ((s.ukupnoKomada / (op / s.idealniTakt)) * 100) : 0, 100);
      const Q = Math.min(s.ukupnoKomada > 0 ? ((s.dobriKomadi / s.ukupnoKomada) * 100) : 0, 100);
      return (A / 100) * (P / 100) * (Q / 100) * 100;
    }).filter((v: number) => v > 0);
    return smjeneOEE.length > 0 ? smjeneOEE.reduce((a: number, b: number) => a + b, 0) / smjeneOEE.length : 0;
  }).filter(v => v > 0);
  return results.length > 0 ? +(results.reduce((a, b) => a + b, 0) / results.length).toFixed(1) : 0;
};

export const getOEEColor = (oee: number): string => {
  if (oee >= 85) return '#1a7a5e';
  if (oee >= 75) return '#16a34a';
  if (oee >= 60) return '#ca8a04';
  return '#dc2626';
};
