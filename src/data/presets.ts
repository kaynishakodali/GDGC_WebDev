import type { DitherPattern, DitherPalette, DitherFit } from '../components/DitherVeil';

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  tag: string;
  props: {
    pattern: DitherPattern;
    palette: DitherPalette;
    pixelSize: number;
    levels: number;
    inkColor: string;
    paperColor: string;
    contrast: number;
    brightness: number;
    revealRadius: number;
    softness: number;
    linger: number;
    rimColor: string;
    rim: number;
    reverse: boolean;
    wander: boolean;
    clickBurst: boolean;
    fit: DitherFit;
  };
  sampleImageIndex?: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  url: string;
  author: string;
}

export interface ColorTheme {
  name: string;
  inkColor: string;
  paperColor: string;
  rimColor: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'editorial-portrait',
    title: 'Avant-Garde Portrait',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1737071371043-761e02b1ef95?q=80&w=1400&auto=format&fit=crop',
    author: 'Unsplash'
  },
  {
    id: 'marble-statue',
    title: 'Classical Sculpture',
    category: 'Sculpture',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1400&auto=format&fit=crop',
    author: 'Birmingham Museums'
  },
  {
    id: 'cyberpunk-neon',
    title: 'Neo-Tokyo Rainy Street',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1400&auto=format&fit=crop',
    author: 'Aleksandar Pasaric'
  },
  {
    id: 'brutalist-arch',
    title: 'Geometric Architecture',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1400&auto=format&fit=crop',
    author: 'Simone Hutsch'
  },
  {
    id: 'misty-forest',
    title: 'Misty Alpine Ridge',
    category: 'Landscape',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1400&auto=format&fit=crop',
    author: 'Kalen Emsley'
  },
  {
    id: 'deep-space',
    title: 'Interstellar Nebula',
    category: 'Cosmos',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1400&auto=format&fit=crop',
    author: 'NASA'
  }
];

export const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'Nordic Paper',
    inkColor: '#120f17',
    paperColor: '#f4f1ea',
    rimColor: '#a78bfa'
  },
  {
    name: 'Game Boy DMG',
    inkColor: '#0f380f',
    paperColor: '#9bbc0f',
    rimColor: '#306230'
  },
  {
    name: 'Amber Phosphor',
    inkColor: '#1c1917',
    paperColor: '#fbbf24',
    rimColor: '#f59e0b'
  },
  {
    name: 'Cyberpunk Synth',
    inkColor: '#0d0221',
    paperColor: '#00f6ed',
    rimColor: '#ff007f'
  },
  {
    name: 'Mono Slate',
    inkColor: '#09090b',
    paperColor: '#fafafa',
    rimColor: '#38bdf8'
  },
  {
    name: 'Oxidized Copper',
    inkColor: '#064e3b',
    paperColor: '#a7f3d0',
    rimColor: '#34d399'
  },
  {
    name: 'Blood Orange',
    inkColor: '#1a0500',
    paperColor: '#ffedd5',
    rimColor: '#ea580c'
  },
  {
    name: 'Blueprint Technical',
    inkColor: '#082f49',
    paperColor: '#e0f2fe',
    rimColor: '#0284c7'
  }
];

export const PRESETS: PresetConfig[] = [
  {
    id: 'default-noir',
    name: 'Editorial Atkinson',
    description: 'Silky error-diffusion dithering with soft purple rim dissolve.',
    tag: 'Classic',
    props: {
      pattern: 'floyd',
      palette: 'duotone',
      pixelSize: 2,
      levels: 2,
      inkColor: '#120f17',
      paperColor: '#f4f1ea',
      contrast: 1.15,
      brightness: 0,
      revealRadius: 210,
      softness: 0.6,
      linger: 1.2,
      rimColor: '#a78bfa',
      rim: 0.1,
      reverse: false,
      wander: false,
      clickBurst: true,
      fit: 'contain'
    },
    sampleImageIndex: 0
  },
  {
    id: 'gameboy-pixel',
    name: 'Game Boy 1-Bit',
    description: 'Chunky 4px pixels with DMG matrix greens and sharp edges.',
    tag: 'Retro 90s',
    props: {
      pattern: 'bayer',
      palette: 'duotone',
      pixelSize: 4,
      levels: 4,
      inkColor: '#0f380f',
      paperColor: '#9bbc0f',
      contrast: 1.35,
      brightness: 0.05,
      revealRadius: 180,
      softness: 0.2,
      linger: 0.8,
      rimColor: '#306230',
      rim: 0.18,
      reverse: false,
      wander: false,
      clickBurst: true,
      fit: 'contain'
    },
    sampleImageIndex: 1
  },
  {
    id: 'cyber-rgb',
    name: 'Cyberpunk RGB Chromatic',
    description: 'Per-channel RGB error-diffusion with electric neon rims.',
    tag: 'Vibrant',
    props: {
      pattern: 'atkinson',
      palette: 'rgb',
      pixelSize: 2,
      levels: 3,
      inkColor: '#0d0221',
      paperColor: '#ffffff',
      contrast: 1.4,
      brightness: 0.02,
      revealRadius: 240,
      softness: 0.75,
      linger: 1.6,
      rimColor: '#ff007f',
      rim: 0.25,
      reverse: false,
      wander: false,
      clickBurst: true,
      fit: 'cover'
    },
    sampleImageIndex: 2
  },
  {
    id: 'engraved-currency',
    name: 'Banknote Engraving',
    description: 'Diagonal etched engraving lines reminiscent of vintage print currency.',
    tag: 'Etched',
    props: {
      pattern: 'lines',
      palette: 'duotone',
      pixelSize: 1,
      levels: 2,
      inkColor: '#022c22',
      paperColor: '#f0fdf4',
      contrast: 1.3,
      brightness: -0.05,
      revealRadius: 220,
      softness: 0.5,
      linger: 1.0,
      rimColor: '#10b981',
      rim: 0.08,
      reverse: false,
      wander: false,
      clickBurst: true,
      fit: 'contain'
    },
    sampleImageIndex: 3
  },
  {
    id: 'blue-noise-stipple',
    name: 'Blue Noise Stipple',
    description: 'Organic stochastic stippling using procedural 64x64 blue noise energy field.',
    tag: 'Stochastic',
    props: {
      pattern: 'noise',
      palette: 'duotone',
      pixelSize: 2,
      levels: 3,
      inkColor: '#1c1917',
      paperColor: '#fafaf9',
      contrast: 1.25,
      brightness: 0,
      revealRadius: 260,
      softness: 0.85,
      linger: 2.0,
      rimColor: '#f59e0b',
      rim: 0.15,
      reverse: false,
      wander: true,
      clickBurst: true,
      fit: 'contain'
    },
    sampleImageIndex: 4
  },
  {
    id: 'ghost-inverted',
    name: 'Inverted Veil (Reverse)',
    description: 'Starts in full glorious color; cursor paints dithered shadow trails.',
    tag: 'Reverse',
    props: {
      pattern: 'floyd',
      palette: 'duotone',
      pixelSize: 3,
      levels: 2,
      inkColor: '#09090b',
      paperColor: '#f43f5e',
      contrast: 1.5,
      brightness: -0.08,
      revealRadius: 220,
      softness: 0.6,
      linger: 1.8,
      rimColor: '#ec4899',
      rim: 0.2,
      reverse: true,
      wander: false,
      clickBurst: true,
      fit: 'cover'
    },
    sampleImageIndex: 5
  }
];
