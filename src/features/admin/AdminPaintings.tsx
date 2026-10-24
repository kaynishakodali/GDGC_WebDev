import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Painting, User } from '../../api/types';
import { api } from '../../api/client';
import { formatINR } from '../../mock/mockStore';
import {
  Palette,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  AlertCircle
} from 'lucide-react';

interface AdminPaintingsProps {
  user: User | null;
}

export const AdminPaintings: React.FC<AdminPaintingsProps> = ({ user }) => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold'>('all');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState(12000);
  const [formImage, setFormImage] = useState('/seed/images/p-001.jpg');
  const [formSaleMode, setFormSaleMode] = useState<'fixed' | 'auction'>('fixed');
  const [formAuctionEndsAt, setFormAuctionEndsAt] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPaintings = async () => {
    setLoading(true);
    try {
      const data = await api.getPaintings();
      setPaintings(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadPaintings();
  }, []);

  const openAddModal = () => {
    setEditingPainting(null);
    setFormTitle('');
    setFormArtist('');
    setFormDesc('');
    setFormPrice(15000);
    setFormImage('/seed/images/p-001.jpg');
    setFormSaleMode('fixed');
    const defaultEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setFormAuctionEndsAt(new Date(defaultEnd.getTime() - defaultEnd.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Painting) => {
    if (p.status === 'sold') return;
    setEditingPainting(p);
    setFormTitle(p.title);
    setFormArtist(p.artist);
    setFormDesc(p.description);
    setFormPrice(p.price);
    setFormImage(p.imageUrl);
    setFormSaleMode(p.saleMode ?? 'fixed');
    const defaultEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endDate = p.auctionEndsAt ? new Date(p.auctionEndsAt) : defaultEnd;
    setFormAuctionEndsAt(new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    try {
      if (editingPainting) {
        await api.updatePainting(editingPainting.id, {
          title: formTitle,
          artist: formArtist,
          description: formDesc,
          price: Number(formPrice),
          imageUrl: formImage,
          saleMode: formSaleMode,
          auctionEndsAt: formSaleMode === 'auction' ? new Date(formAuctionEndsAt).toISOString() : null
        });
      } else {
        await api.addPainting({
          title: formTitle,
          artist: formArtist,
          description: formDesc,
          price: Number(formPrice),
          imageUrl: formImage,
          saleMode: formSaleMode,
          auctionEndsAt: formSaleMode === 'auction' ? new Date(formAuctionEndsAt).toISOString() : null
        });
      }
      setIsModalOpen(false);
      await loadPaintings();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = paintings.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.artist.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AdminLayout user={user}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-serif-display font-bold text-white">
              Paintings Inventory
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Manage original artwork catalogue records, pricing, and availability.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#273469] hover:bg-[#7d68ff] text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-98 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Artwork</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-xl bg-[#273469] border border-white/10">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-[#10212C] px-3 py-1.5 rounded-lg border border-white/5">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, artist or ID..."
              className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none w-full font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs self-start sm:self-auto">
            <span className="text-zinc-500 mr-1">Status:</span>
            {(['all', 'available', 'sold'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Inventory Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#273469] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Artwork</th>
                  <th className="py-3 px-4">Artist</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => {
                  const isSold = p.status === 'sold';
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                          <div>
                            <div className="font-sans font-medium text-white line-clamp-1 max-w-xs">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-zinc-500">{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 font-sans">{p.artist}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {p.saleMode === 'auction' ? (
                          <div className="space-y-1">
                            <div className="text-[10px] text-zinc-400">Opening {formatINR(p.price)}</div>
                            <div>Current {formatINR(p.currentBid ?? p.price)}</div>
                            <div className="text-[10px] text-zinc-400">{p.bidCount ?? 0} bids</div>
                          </div>
                        ) : formatINR(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        {isSold ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> SOLD
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> AVAILABLE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isSold ? (
                          <span
                            className="text-[11px] text-zinc-500 cursor-not-allowed"
                            title="Sold paintings cannot be edited while in collector hands."
                          >
                            Locked (Sold)
                          </span>
                        ) : (
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add / Edit Painting */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#273469] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-serif-display font-semibold text-white">
                {editingPainting ? `Edit Artwork (${editingPainting.id})` : 'Add New Artwork'}
              </h3>

              {modalError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Painting Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Warli Harvest Ritual"
                    className="w-full bg-[#10212C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#273469]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Master Artisan Name</label>
                  <input
                    type="text"
                    required
                    value={formArtist}
                    onChange={(e) => setFormArtist(e.target.value)}
                    placeholder="e.g. Meera Kumari"
                    className="w-full bg-[#10212C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#273469]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">{formSaleMode === 'auction' ? 'Opening bid (₹ INR)' : 'Price (₹ INR)'}</label>
                  <input
                    type="number"
                    required
                    min={formSaleMode === 'auction' ? '1' : '500'}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#10212C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#273469]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Sale format</label>
                  <select
                    value={formSaleMode}
                    onChange={(e) => setFormSaleMode(e.target.value as 'fixed' | 'auction')}
                    className="w-full bg-[#10212C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#273469]"
                  >
                    <option value="fixed">Fixed price</option>
                    <option value="auction">Bidding auction</option>
                  </select>
                </div>

                {formSaleMode === 'auction' && (
                  <div>
                    <label className="block text-zinc-400 mb-1">Auction closes</label>
                    <input
                      type="datetime-local"
                      required
                      min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      value={formAuctionEndsAt}
                      onChange={(e) => setFormAuctionEndsAt(e.target.value)}
                      className="w-full bg-[#10212C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#273469]"
                    />
                    <p className="mt-1 text-[10px] text-zinc-500">The opening bid uses the price above. Each new bid must be at least ₹1 higher.</p>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 mb-1">Image Reference Path / URL</label>
                  <input
                    type="text"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/seed/images/p-001.jpg"
                    className="w-full bg-[#10212C] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#273469]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Artistic style, pigments, dimensions..."
                    className="w-full bg-[#10212C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#273469]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#273469] hover:bg-[#7d68ff] text-white font-bold transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
