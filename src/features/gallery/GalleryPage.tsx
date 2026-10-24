import React, { useState, useEffect, useCallback } from 'react';
import { BrandBar } from '../../components/BrandBar';
import { BrowseView } from './BrowseView';
import { Walk3DView } from './Walk3DView';
import { Painting, PotteryItem, Glaze, User } from '../../api/types';
import {
  listPaintings,
  listPotteryItems,
  listGlazes,
  getMuralConfig
} from '../../services';
import { ItemDetailModal } from '../../components/ItemDetailModal';
import { Compass, Grid, Sparkles, AlertCircle } from 'lucide-react';

interface GalleryPageProps {
  user: User | null;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ user }) => {
  // Browse default on touch devices or reduced motion
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [mode, setMode] = useState<'3d' | 'browse'>(isTouch || prefersReduced ? 'browse' : '3d');
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [potteryItems, setPotteryItems] = useState<PotteryItem[]>([]);
  const [glazes, setGlazes] = useState<Glaze[]>([]);
  const [muralRate, setMuralRate] = useState<number>(150);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for 2D Browse
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [selectedPottery, setSelectedPottery] = useState<PotteryItem | null>(null);
  const [modalType, setModalType] = useState<'painting' | 'pottery'>('painting');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, potData, gData, mural] = await Promise.all([
        listPaintings(),
        listPotteryItems(),
        listGlazes(),
        getMuralConfig()
      ]);
      setPaintings(pData);
      setPotteryItems(potData);
      setGlazes(gData);
      setMuralRate(mural.ratePerSqFt);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Failed to load gallery exhibition.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectPainting = (p: Painting) => {
    setSelectedPainting(p);
    setModalType('painting');
    setIsModalOpen(true);
  };

  const handleSelectPottery = (pot: PotteryItem) => {
    setSelectedPottery(pot);
    setModalType('pottery');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans-ui relative">
      {/* 3D Mode renders in full-screen with overlay BrandBar */}
      {mode === '3d' ? (
        <>
          <BrandBar user={user} overlay={true} />
          <Walk3DView
            paintings={paintings}
            potteryItems={potteryItems}
            glazes={glazes}
            muralRate={muralRate}
            user={user}
            onRefresh={fetchData}
            onSwitchToBrowse={() => setMode('browse')}
          />
        </>
      ) : (
        <>
          <BrandBar user={user} overlay={false} />

          {/* Mode Switch Header inside Browse mode */}
          <div className="bg-[#273469]/60 backdrop-blur-md border-b border-white/10 px-5 sm:px-8 py-3 flex items-center justify-between sticky top-[72px] z-30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFD65A]" />
              <span className="text-xs font-mono-hud text-[#E3D0BE]">
                {paintings.length} Original Artworks
              </span>
            </div>

            <div className="flex items-center p-1 rounded-full bg-[#273469] border border-white/10">
              <button
                onClick={() => setMode('3d')}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-[#E3D0BE] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#F4A900]" />
                <span>3D Gallery</span>
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F4A900] text-[#28201C] shadow-sm flex items-center gap-1.5"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Browse Grid</span>
              </button>
            </div>
          </div>

          <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 pt-6">
            {error && (
              <div className="p-4 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-[#FF5C5C] text-xs flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            <BrowseView
              paintings={paintings}
              potteryItems={potteryItems}
              glazes={glazes}
              muralRate={muralRate}
              user={user}
              loading={loading}
              onRefresh={fetchData}
              onSelectPainting={handleSelectPainting}
              onSelectPottery={handleSelectPottery}
            />
          </main>

          {/* Shared Details Modal in Browse View */}
          <ItemDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            type={modalType}
            painting={selectedPainting}
            pottery={selectedPottery}
            glazes={glazes}
            allPaintings={paintings}
            allPottery={potteryItems}
            onSelectPainting={setSelectedPainting}
            onSelectPottery={setSelectedPottery}
            user={user}
            onPaintingBought={fetchData}
            onPaintingBid={fetchData}
          />
        </>
      )}
    </div>
  );
};
