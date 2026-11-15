/**
 * Deniz yolu haritası verisi (scripts/make-map.mjs ve sayfa tarafından kullanılır).
 * Rotalar temsilîdir: Çanakkale – Ege – Sicilya Kanalı – Cebelitarık – Atlantik.
 */
export type LonLat = [number, number];

export const W = 1200;
export const H = 940;

export const ORIGIN: LonLat = [28.68, 40.97];

export const TRUNK: LonLat[] = [
  ORIGIN, [27.9, 40.8], [26.9, 40.5], [26.35, 40.15], [25.7, 39.5], [25.0, 38.3], [24.2, 37.2],
  [23.0, 36.1], [20.0, 35.8], [16.0, 36.2], [12.6, 37.0], [10.6, 37.6], [7.5, 37.7], [3.0, 37.2],
  [-2.0, 36.3], [-5.6, 35.95], [-9.0, 35.2], [-13.5, 30.5], [-18.5, 24.0], [-23.0, 17.0], [-26.0, 12.0],
];

export const ATLANTIC: LonLat[] = [
  [-26.0, 12.0], [-29.5, 3.0], [-32.6, -6.0], [-35.4, -13.0], [-37.6, -19.0], [-41.5, -23.7],
  [-46.3, -23.96], [-47.6, -25.4], [-48.51, -25.5], [-48.3, -27.6], [-49.7, -30.6], [-52.6, -34.2],
  [-54.9, -35.2], [-56.21, -34.9], [-58.37, -34.6],
];

export const PACIFIC: LonLat[] = [
  [-26.0, 12.0], [-40.0, 14.2], [-55.0, 13.6], [-61.6, 12.9], [-68.0, 12.5], [-73.4, 11.2],
  [-75.53, 10.4], [-77.8, 9.9], [-79.9, 9.35], [-79.55, 8.9], [-79.9, 7.0], [-80.7, 3.2],
  [-81.5, -1.5], [-81.7, -5.0], [-79.9, -8.8], [-77.4, -12.05], [-76.2, -16.4], [-72.6, -19.8],
  [-71.4, -25.0], [-71.9, -30.0], [-71.62, -33.59],
];

/** Ana hattan limana kısa bağlantılar. */
export const SPURS: LonLat[][] = [
  [[-80.7, 3.2], [-78.6, 3.6], [-77.07, 3.88]],
  [[-81.5, -1.5], [-80.6, -2.5], [-79.9, -2.2]],
];

export type Port = { name: string; cc: string; at: LonLat; dx: number; dy: number; anchor: "start" | "end" | "middle" };

export const PORTS: Port[] = [
  { name: "Cartagena", cc: "CO", at: [-75.53, 10.4], dx: 0, dy: -14, anchor: "middle" },
  { name: "Buenaventura", cc: "CO", at: [-77.07, 3.88], dx: 10, dy: 5, anchor: "start" },
  { name: "Guayaquil", cc: "EC", at: [-79.9, -2.2], dx: 10, dy: 6, anchor: "start" },
  { name: "Callao", cc: "PE", at: [-77.15, -12.05], dx: -12, dy: 5, anchor: "end" },
  { name: "San Antonio", cc: "CL", at: [-71.62, -33.59], dx: -12, dy: 5, anchor: "end" },
  { name: "Santos", cc: "BR", at: [-46.3, -23.96], dx: 12, dy: -2, anchor: "start" },
  { name: "Paranaguá", cc: "BR", at: [-48.51, -25.5], dx: 12, dy: 12, anchor: "start" },
  { name: "Montevideo", cc: "UY", at: [-56.21, -34.9], dx: 6, dy: 20, anchor: "start" },
  { name: "Buenos Aires", cc: "AR", at: [-58.37, -34.6], dx: -10, dy: 24, anchor: "end" },
];

// ISO 3166-1 sayısal kodlar
export const TARGET = new Set(["032", "068", "076", "152", "170", "218", "600", "604", "858", "862"]);
export const TURKEY = "792";

export const ATLANTIC_PORTS = PORTS.filter((x) => x.at[0] > -60).map((x) => x.name);
export const PACIFIC_PORTS = PORTS.filter((x) => x.at[0] <= -60).map((x) => x.name);
