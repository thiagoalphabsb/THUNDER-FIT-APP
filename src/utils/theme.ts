export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeColor = 'tiffany' | 'emerald' | 'amber' | 'rose' | 'violet' | 'blue' | 'orange';

export interface ThemeColorPreset {
  id: ThemeColor;
  name: string;
  label: string;
  hex: string;
  hexLight: string;
  rgb: string;
  gradient: string;
  glow: string;
}

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    id: 'tiffany',
    name: 'Tiffany Cyan',
    label: 'Clássico Thunder',
    hex: '#00D1C1',
    hexLight: '#00A89B',
    rgb: '0, 209, 193',
    gradient: 'from-[#00D1C1] to-[#009b8f]',
    glow: 'rgba(0, 209, 193, 0.4)'
  },
  {
    id: 'emerald',
    name: 'Esmeralda Neon',
    label: 'Vitalidade & Energia',
    hex: '#10B981',
    hexLight: '#059669',
    rgb: '16, 185, 129',
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  {
    id: 'amber',
    name: 'Âmbar Dourado',
    label: 'Fogo & Determinação',
    hex: '#F59E0B',
    hexLight: '#D97706',
    rgb: '245, 158, 11',
    gradient: 'from-amber-400 to-yellow-500',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  {
    id: 'rose',
    name: 'Rubi Carmesim',
    label: 'Intensidade Máxima',
    hex: '#F43F5E',
    hexLight: '#E11D48',
    rgb: '244, 63, 94',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'rgba(244, 63, 94, 0.4)'
  },
  {
    id: 'violet',
    name: 'Violeta Elétrico',
    label: 'Hipertrofia & Força',
    hex: '#8B5CF6',
    hexLight: '#7C3AED',
    rgb: '139, 92, 246',
    gradient: 'from-purple-500 to-indigo-500',
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  {
    id: 'blue',
    name: 'Azul Performance',
    label: 'Precisão & Foco',
    hex: '#3B82F6',
    hexLight: '#2563EB',
    rgb: '59, 130, 246',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  {
    id: 'orange',
    name: 'Laranja Solar',
    label: 'Dinamismo & Potência',
    hex: '#F97316',
    hexLight: '#EA580C',
    rgb: '249, 115, 22',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'rgba(249, 115, 22, 0.4)'
  }
];

const THEME_MODE_STORAGE_KEY = 'thunder_theme_mode';
const THEME_COLOR_STORAGE_KEY = 'thunder_theme_color';

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'dark';
}

export function getStoredThemeColor(): ThemeColor {
  if (typeof window === 'undefined') return 'tiffany';
  const stored = localStorage.getItem(THEME_COLOR_STORAGE_KEY) as ThemeColor | null;
  const exists = THEME_COLOR_PRESETS.some((p) => p.id === stored);
  return exists && stored ? stored : 'tiffany';
}

export function resolveSystemMode(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Applies the given theme mode ('dark' | 'light' | 'system') and theme accent color to <html> and <body>.
 */
export function applyTheme(mode: ThemeMode = 'dark', color: ThemeColor = 'tiffany') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // 1. Resolve Mode
  const effectiveMode = mode === 'system' ? resolveSystemMode() : mode;

  root.setAttribute('data-mode', effectiveMode);
  body.setAttribute('data-mode', effectiveMode);

  if (effectiveMode === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    body.classList.remove('dark');
    body.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    body.classList.remove('light');
    body.classList.add('dark');
  }

  // 2. Resolve Color Preset
  const preset = THEME_COLOR_PRESETS.find((p) => p.id === color) || THEME_COLOR_PRESETS[0];

  root.setAttribute('data-color', preset.id);
  body.setAttribute('data-color', preset.id);

  // Set CSS Variables on root
  root.style.setProperty('--theme-accent', effectiveMode === 'light' ? preset.hexLight : preset.hex);
  root.style.setProperty('--theme-accent-rgb', preset.rgb);
  root.style.setProperty('--theme-accent-glow', preset.glow);

  // Save in localStorage for fast bootstrap on reload
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    localStorage.setItem(THEME_COLOR_STORAGE_KEY, preset.id);
  } catch {
    // Ignore storage errors
  }
}
