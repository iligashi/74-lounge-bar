'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

const contentFields = [
  { key: 'hero_title', label: 'Hero Title' },
  { key: 'hero_subtitle', label: 'Hero Subtitle' },
  { key: 'about_title', label: 'About Title' },
  { key: 'about_text', label: 'About Text', multiline: true },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'opening_hours', label: 'Opening Hours', multiline: true },
  { key: 'facebook', label: 'Facebook URL' },
  { key: 'instagram', label: 'Instagram URL' },
];

export default function ContentPage() {
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getContent().then(data => {
      const flat = {};
      for (const [key, val] of Object.entries(data)) {
        flat[key] = { al: val.al || '', en: val.en || '' };
      }
      setContent(flat);
    }).catch(() => {});
  }, []);

  const handleChange = (key, lang, value) => {
    setContent(c => ({
      ...c,
      [key]: { ...c[key], [lang]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(content).map(([key, val]) => ({
        key,
        value_al: val.al,
        value_en: val.en,
      }));
      await api.updateContent(items);
      toast.success('Content saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-lounge-100">Site Content</h1>
        <button onClick={handleSave} disabled={saving} className="btn-gold text-xs">
          <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="space-y-6">
        {contentFields.map(field => (
          <div key={field.key} className="card-dark p-5">
            <h3 className="text-sm text-gold-400 font-serif mb-4">{field.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-lounge-500 mb-1">Albanian</label>
                {field.multiline ? (
                  <textarea
                    value={content[field.key]?.al || ''}
                    onChange={e => handleChange(field.key, 'al', e.target.value)}
                    className="input-field text-sm resize-none"
                    rows={4}
                  />
                ) : (
                  <input
                    value={content[field.key]?.al || ''}
                    onChange={e => handleChange(field.key, 'al', e.target.value)}
                    className="input-field text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-lounge-500 mb-1">English</label>
                {field.multiline ? (
                  <textarea
                    value={content[field.key]?.en || ''}
                    onChange={e => handleChange(field.key, 'en', e.target.value)}
                    className="input-field text-sm resize-none"
                    rows={4}
                  />
                ) : (
                  <input
                    value={content[field.key]?.en || ''}
                    onChange={e => handleChange(field.key, 'en', e.target.value)}
                    className="input-field text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-gold text-xs">
          <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
