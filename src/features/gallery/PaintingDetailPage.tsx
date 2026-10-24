import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Painting, User } from '../../api/types';
import { getPainting, listPaintings } from '../../services';
import { ItemDetailModal } from '../../components/ItemDetailModal';
import { BrandBar } from '../../components/BrandBar';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface PaintingDetailProps {
  user: User | null;
}

export const PaintingDetailPage: React.FC<PaintingDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [painting, setPainting] = useState<Painting | null>(null);
  const [paintingsList, setPaintingsList] = useState<Painting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [item, all] = await Promise.all([
        getPainting(targetId),
        listPaintings()
      ]);
      setPainting(item);
      setPaintingsList(all);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || 'Artwork not found or archived.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const handleClose = () => {
    navigate('/gallery');
  };

  const handleSelectPainting = (p: Painting) => {
    navigate(`/gallery/${p.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFF5E6] flex flex-col font-sans-ui">
      <BrandBar user={user} />

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FF5C5C]/20 border border-[#FF5C5C]/40 flex items-center justify-center text-[#FF5C5C]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-display font-light text-white">Painting Unavailable</h2>
          <p className="text-xs text-[#E3D0BE] max-w-sm">{error}</p>
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Gallery</span>
          </button>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center font-mono-hud text-xs text-[#E3D0BE]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F4A900] animate-ping" />
            <span>Loading masterwork...</span>
          </div>
        </div>
      ) : (
        <ItemDetailModal
          isOpen={true}
          onClose={handleClose}
          type="painting"
          painting={painting}
          allPaintings={paintingsList}
          onSelectPainting={handleSelectPainting}
          user={user}
          onPaintingBought={() => {
            if (id) loadData(id);
          }}
        />
      )}
    </div>
  );
};
