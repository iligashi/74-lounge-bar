'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X, Save, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuManagementPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('items');
  const [showCatForm, setShowCatForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const emptyCat = { name_al: '', name_en: '', description_al: '', description_en: '', sort_order: 0, is_active: 1 };
  const emptyItem = { category_id: '', name_al: '', name_en: '', description_al: '', description_en: '', price: '', image: '', is_available: 1, is_featured: 0, sort_order: 0 };

  const [catForm, setCatForm] = useState(emptyCat);
  const [itemForm, setItemForm] = useState(emptyItem);

  const fetchData = () => {
    api.getAdminCategories().then(setCategories).catch(() => {});
    api.getAdminItems().then(setItems).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  // Category CRUD
  const handleSaveCat = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.updateCategory(editingCat.id, catForm);
        toast.success('Category updated');
      } else {
        await api.createCategory(catForm);
        toast.success('Category created');
      }
      setCatForm(emptyCat);
      setEditingCat(null);
      setShowCatForm(false);
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  const handleEditCat = (cat) => {
    setCatForm({ name_al: cat.name_al, name_en: cat.name_en, description_al: cat.description_al, description_en: cat.description_en, sort_order: cat.sort_order, is_active: cat.is_active });
    setEditingCat(cat);
    setShowCatForm(true);
  };

  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted');
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  // Item CRUD
  const handleSaveItem = async (e) => {
    e.preventDefault();
    const data = { ...itemForm, price: parseFloat(itemForm.price), sort_order: parseInt(itemForm.sort_order) || 0 };
    try {
      if (editingItem) {
        await api.updateItem(editingItem.id, data);
        toast.success('Item updated');
      } else {
        await api.createItem(data);
        toast.success('Item created');
      }
      setItemForm(emptyItem);
      setEditingItem(null);
      setShowItemForm(false);
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  const handleEditItem = (item) => {
    setItemForm({
      category_id: item.category_id,
      name_al: item.name_al, name_en: item.name_en,
      description_al: item.description_al, description_en: item.description_en,
      price: item.price, image: item.image || '',
      is_available: item.is_available, is_featured: item.is_featured,
      sort_order: item.sort_order,
    });
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.deleteItem(id);
      toast.success('Item deleted');
      fetchData();
    } catch (err) { toast.error(err.message); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await api.uploadImage(file);
      setItemForm(f => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-lounge-100">Menu Management</h1>
        <div className="flex space-x-2">
          <button onClick={() => setTab('items')}
            className={`px-4 py-2 text-xs rounded tracking-wider uppercase ${tab === 'items' ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'text-lounge-500 border border-transparent'}`}>
            Items
          </button>
          <button onClick={() => setTab('categories')}
            className={`px-4 py-2 text-xs rounded tracking-wider uppercase ${tab === 'categories' ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'text-lounge-500 border border-transparent'}`}>
            Categories
          </button>
        </div>
      </div>

      {/* Categories Tab */}
      {tab === 'categories' && (
        <div>
          <button onClick={() => { setCatForm(emptyCat); setEditingCat(null); setShowCatForm(true); }}
            className="btn-gold text-xs mb-6">
            <Plus size={14} className="mr-1" /> Add Category
          </button>

          {showCatForm && (
            <div className="card-dark p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-gold-400">{editingCat ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => { setShowCatForm(false); setEditingCat(null); }} className="text-lounge-500 hover:text-lounge-300"><X size={16} /></button>
              </div>
              <form onSubmit={handleSaveCat} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Name (Albanian)</label>
                  <input value={catForm.name_al} onChange={e => setCatForm(f => ({ ...f, name_al: e.target.value }))} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Name (English)</label>
                  <input value={catForm.name_en} onChange={e => setCatForm(f => ({ ...f, name_en: e.target.value }))} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Description (Albanian)</label>
                  <input value={catForm.description_al} onChange={e => setCatForm(f => ({ ...f, description_al: e.target.value }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Description (English)</label>
                  <input value={catForm.description_en} onChange={e => setCatForm(f => ({ ...f, description_en: e.target.value }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Sort Order</label>
                  <input type="number" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input-field text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={catForm.is_active === 1} onChange={e => setCatForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} className="rounded" />
                    <span className="text-sm text-lounge-400">Active</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn-gold text-xs"><Save size={14} className="mr-1" /> Save</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="card-dark p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lounge-200 font-serif">{cat.name_en}</span>
                    <span className="text-lounge-500 text-sm">/ {cat.name_al}</span>
                    {!cat.is_active && <span className="text-xs text-red-400/60 border border-red-400/30 px-1.5 py-0.5 rounded">Inactive</span>}
                  </div>
                  <p className="text-xs text-lounge-600 mt-1">Order: {cat.sort_order}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEditCat(cat)} className="p-1.5 text-lounge-500 hover:text-gold-400"><Edit2 size={14} /></button>
                  <button onClick={() => handleDeleteCat(cat.id)} className="p-1.5 text-lounge-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {tab === 'items' && (
        <div>
          <button onClick={() => { setItemForm({ ...emptyItem, category_id: categories[0]?.id || '' }); setEditingItem(null); setShowItemForm(true); }}
            className="btn-gold text-xs mb-6">
            <Plus size={14} className="mr-1" /> Add Item
          </button>

          {showItemForm && (
            <div className="card-dark p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-gold-400">{editingItem ? 'Edit Item' : 'New Item'}</h3>
                <button onClick={() => { setShowItemForm(false); setEditingItem(null); }} className="text-lounge-500 hover:text-lounge-300"><X size={16} /></button>
              </div>
              <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-lounge-500 mb-1">Category</label>
                  <select value={itemForm.category_id} onChange={e => setItemForm(f => ({ ...f, category_id: parseInt(e.target.value) }))} className="input-field text-sm" required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Name (Albanian)</label>
                  <input value={itemForm.name_al} onChange={e => setItemForm(f => ({ ...f, name_al: e.target.value }))} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Name (English)</label>
                  <input value={itemForm.name_en} onChange={e => setItemForm(f => ({ ...f, name_en: e.target.value }))} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Description (Albanian)</label>
                  <textarea value={itemForm.description_al} onChange={e => setItemForm(f => ({ ...f, description_al: e.target.value }))} className="input-field text-sm resize-none" rows={2} />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Description (English)</label>
                  <textarea value={itemForm.description_en} onChange={e => setItemForm(f => ({ ...f, description_en: e.target.value }))} className="input-field text-sm resize-none" rows={2} />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Price (€)</label>
                  <input type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Sort Order</label>
                  <input type="number" value={itemForm.sort_order} onChange={e => setItemForm(f => ({ ...f, sort_order: e.target.value }))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-lounge-500 mb-1">Image</label>
                  <div className="flex items-center space-x-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-lounge-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-lounge-800 file:text-lounge-400" />
                    {itemForm.image && <span className="text-xs text-green-400">Uploaded</span>}
                  </div>
                </div>
                <div className="flex items-end space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={itemForm.is_available === 1} onChange={e => setItemForm(f => ({ ...f, is_available: e.target.checked ? 1 : 0 }))} />
                    <span className="text-sm text-lounge-400">Available</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={itemForm.is_featured === 1} onChange={e => setItemForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))} />
                    <span className="text-sm text-lounge-400">Featured</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn-gold text-xs"><Save size={14} className="mr-1" /> Save</button>
                </div>
              </form>
            </div>
          )}

          {/* Items grouped by category */}
          {categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.id} className="mb-8">
                <h3 className="text-sm tracking-[0.2em] text-gold-500/70 uppercase mb-3 font-serif">{cat.name_en}</h3>
                <div className="space-y-1">
                  {catItems.map(item => (
                    <div key={item.id} className="card-dark p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-lounge-200 text-sm">{item.name_en}</span>
                          <span className="text-gold-400/70 text-sm font-serif">€{parseFloat(item.price).toFixed(2)}</span>
                          {item.is_featured === 1 && <span className="text-xs text-gold-400/60 border border-gold-400/30 px-1.5 py-0.5 rounded">Featured</span>}
                          {!item.is_available && <span className="text-xs text-red-400/60 border border-red-400/30 px-1.5 py-0.5 rounded">Unavailable</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditItem(item)} className="p-1.5 text-lounge-500 hover:text-gold-400"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-lounge-500 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
