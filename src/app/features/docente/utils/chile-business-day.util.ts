export function toLocalYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function easterSunday(year: number): Date {
  // Anonymous Gregorian algorithm (Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function nearestMonday(baseDate: Date): Date {
  const day = baseDate.getDay(); // 0..6
  if (day === 1) return new Date(baseDate);
  if (day >= 2 && day <= 4) return addDays(baseDate, -(day - 1)); // Tue-Thu => previous Monday
  if (day === 5) return addDays(baseDate, 3); // Friday => next Monday
  return new Date(baseDate); // Saturday/Sunday remain unchanged
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function chileanHolidaySet(year: number): Set<string> {
  const easter = easterSunday(year);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);

  // 29 Jun and 12 Oct are moved according to Ley 19.668
  const sanPedroSanPablo = nearestMonday(new Date(year, 5, 29));
  const encuentroDosMundos = nearestMonday(new Date(year, 9, 12));

  // Día Nacional de los Pueblos Indígenas: around winter solstice.
  // In practice most years this is observed on Jun 21 in Chile.
  const pueblosIndigenas = new Date(year, 5, 21);

  const holidays = [
    new Date(year, 0, 1),   // Año Nuevo
    goodFriday,             // Viernes Santo
    holySaturday,           // Sábado Santo
    new Date(year, 4, 1),   // Día del Trabajo
    new Date(year, 4, 21),  // Glorias Navales
    pueblosIndigenas,       // Pueblos Indígenas
    sanPedroSanPablo,       // San Pedro y San Pablo (trasladable)
    new Date(year, 6, 16),  // Virgen del Carmen
    new Date(year, 7, 15),  // Asunción de la Virgen
    new Date(year, 8, 18),  // Fiestas Patrias
    new Date(year, 8, 19),  // Glorias del Ejército
    encuentroDosMundos,     // Encuentro de Dos Mundos (trasladable)
    new Date(year, 9, 31),  // Iglesias Evangélicas
    new Date(year, 10, 1),  // Todos los Santos
    new Date(year, 11, 8),  // Inmaculada Concepción
    new Date(year, 11, 25), // Navidad
  ];

  return new Set(holidays.map(toLocalYmd));
}

const holidaysByYearCache = new Map<number, Set<string>>();

function getHolidaysForYear(year: number): Set<string> {
  const cached = holidaysByYearCache.get(year);
  if (cached) return cached;

  const computed = chileanHolidaySet(year);
  holidaysByYearCache.set(year, computed);
  return computed;
}

export function isBusinessDayChile(date: Date): boolean {
  const weekday = date.getDay();
  const isWeekend = weekday === 0 || weekday === 6;
  if (isWeekend) return false;

  const ymd = toLocalYmd(date);
  return !getHolidaysForYear(date.getFullYear()).has(ymd);
}
