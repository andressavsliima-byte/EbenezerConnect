import { useEffect, useState } from 'react';
import { promosAPI, uploadAPI } from '../api';
import { PlusCircle, Trash2, Save, Image as ImageIcon, Link as LinkIcon, Hash } from 'lucide-react';

export default function AdminPromos() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', linkUrl: '', order: 0, active: true, imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await promosAPI.getAll();
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await uploadAPI.uploadImage(fd);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setUploading(false);
    }
  };

  const create = async () => {
    if (!form.imageUrl) return alert('Envie uma imagem');
    await promosAPI.create({ ...form, order: Number(form.order) || 0, active: Boolean(form.active) });
    setForm({ title: '', subtitle: '', linkUrl: '', order: 0, active: true, imageUrl: '' });
    await load();
  };

  const save = async (id, patch) => {
    await promosAPI.update(id, patch);
    await load();
  };

  const remove = async (id) => {
    if (!confirm('Remover banner?')) return;
    await promosAPI.remove(id);
    await load();
  };

  return (
    <div className="container-page">
      <h1 className="text-3xl font-bold mb-6">Banners do Catálogo</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Novo Banner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Imagem</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={onFile} />
              {uploading && <span className="text-gray-500">Enviando...</span>}
            </div>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-3 w-full h-40 object-cover rounded" />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <input className="input w-full" placeholder="Título (opcional)" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
            </div>
            <input className="input w-full" placeholder="Subtítulo (opcional)" value={form.subtitle} onChange={(e)=>setForm({...form,subtitle:e.target.value})} />
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gray-500" />
              <input className="input w-full" placeholder="Link (opcional)" value={form.linkUrl} onChange={(e)=>setForm({...form,linkUrl:e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <input className="input w-full" type="number" placeholder="Ordem (0 primeiro)" value={form.order} onChange={(e)=>setForm({...form,order:e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={form.active} onChange={(e)=>setForm({...form,active:e.target.checked})} />
              <label htmlFor="active">Ativo</label>
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={create} disabled={uploading}>
              <PlusCircle className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Banners</h2>
        <div className="space-y-4">
          {items.map((b) => (
            <div key={b._id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl">
              <img src={b.imageUrl} alt={b.title} className="w-full md:w-64 h-32 object-cover rounded" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="input" defaultValue={b.title} placeholder="Título" onBlur={(e)=>save(b._id,{ title:e.target.value })} />
                <input className="input" defaultValue={b.subtitle} placeholder="Subtítulo" onBlur={(e)=>save(b._id,{ subtitle:e.target.value })} />
                <input className="input" defaultValue={b.linkUrl} placeholder="Link" onBlur={(e)=>save(b._id,{ linkUrl:e.target.value })} />
                <input className="input" type="number" defaultValue={b.order} placeholder="Ordem" onBlur={(e)=>save(b._id,{ order:Number(e.target.value)||0 })} />
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={b.active} onChange={(e)=>save(b._id,{ active:e.target.checked })} />
                  Ativo
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn-outline flex items-center gap-2" onClick={()=>save(b._id,{})}>
                  <Save className="w-4 h-4" />Salvar
                </button>
                <button className="text-red-600 flex items-center gap-2" onClick={()=>remove(b._id)}>
                  <Trash2 className="w-4 h-4" /> Remover
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-500">Nenhum banner cadastrado.</p>}
        </div>
      </div>
    </div>
  );
}
