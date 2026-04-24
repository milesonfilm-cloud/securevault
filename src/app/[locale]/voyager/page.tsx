import type { Metadata } from 'next';
import VoyagerGallery from './VoyagerGallery';

export const metadata: Metadata = {
  title: 'Voyager2 — Editorial carousel',
  description: 'Full-page dark editorial UI with 3D card carousel (demo).',
};

export default function VoyagerPage() {
  return <VoyagerGallery />;
}
