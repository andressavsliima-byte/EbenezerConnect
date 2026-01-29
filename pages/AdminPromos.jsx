import { useEffect, useState } from 'react';
import { promosAPI, uploadAPI } from '../api';
import { PlusCircle, Trash2, Save, Image as ImageIcon, Link as LinkIcon, Hash } from 'lucide-react';

export default function AdminPromos() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('desktop'); // 'desktop' or 'mobile'
  const [form, setForm] = useState({ title: '', subtitle: '', linkUrl: '', order: 0, active: true, imageUrl: '', imageDesktopUrl: '', imageDesktopUrls: [], imageMobileUrl: '' });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await promosAPI.getAll();
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  // onFile supports 'desktop' or 'mobile' target via data-target on the input
  const onFile = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const target = e.target.dataset?.target || 'desktop';
    setUploading(true);
    try {
      // handle multiple desktop files (batch upload)
      if (target === 'desktop' && files.length > 1) {
        const uploaded = [];
        for (let i = 0; i < files.length; i++) {
          const fd = new FormData();
          fd.append('image', files[i]);
          const { data } = await uploadAPI.uploadImage(fd);
          uploaded.push(data.url);
        }
        setForm((f) => ({ ...f, imageDesktopUrls: [...(f.imageDesktopUrls || []), ...uploaded] }));
        return;
      }

      // single file handling
      const file = files[0];
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await uploadAPI.uploadImage(fd);
      const url = data.url;
      if (target === 'mobile') setForm((f) => ({ ...f, imageMobileUrl: url }));
      else if (target === 'desktop') setForm((f) => ({ ...f, imageDesktopUrl: url, imageDesktopUrls: [...(f.imageDesktopUrls||[]), url] }));
      else setForm((f) => ({ ...f, imageUrl: url }));
    } finally {
      setUploading(false);
    }
  };

  const create = async () => {
    // require at least one image (desktop or mobile or legacy imageUrl)
    const hasDesktopMultiple = Array.isArray(form.imageDesktopUrls) && form.imageDesktopUrls.length > 0;
    const hasDesktopSingle = !!form.imageDesktopUrl;
    const hasMobile = !!form.imageMobileUrl;
    const hasLegacy = !!form.imageUrl;
    if (!hasDesktopMultiple && !hasDesktopSingle && !hasMobile && !hasLegacy) return alert('Envie ao menos uma imagem (desktop ou mobile)');

    const common = { title: form.title, subtitle: form.subtitle, linkUrl: form.linkUrl, order: Number(form.order) || 0, active: Boolean(form.active) };

    if (hasDesktopMultiple) {
      // create one promo per desktop image
      await Promise.all(form.imageDesktopUrls.map((url) => promosAPI.create({ ...common, imageDesktopUrl: url })));
    } else if (hasDesktopSingle) {
      await promosAPI.create({ ...common, imageDesktopUrl: form.imageDesktopUrl });
    } else if (hasMobile) {
      await promosAPI.create({ ...common, imageMobileUrl: form.imageMobileUrl });
    } else {
      await promosAPI.create({ ...common, imageUrl: form.imageUrl });
    }

    setForm({ title: '', subtitle: '', linkUrl: '', order: 0, active: true, imageUrl: '', imageDesktopUrl: '', imageDesktopUrls: [], imageMobileUrl: '' });
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

        {/* Tabs: Desktop / Mobile */}
        <div className="mb-4">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              className={`px-4 py-2 rounded-md font-medium ${tab === 'desktop' ? 'bg-white shadow' : 'text-gray-600'}`}
              onClick={() => setTab('desktop')}
            >
              PC
            </button>
            <button
              className={`ml-1 px-4 py-2 rounded-md font-medium ${tab === 'mobile' ? 'bg-white shadow' : 'text-gray-600'}`}
              onClick={() => setTab('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {tab === 'desktop' && (
              <>
                <label className="label">Imagem (Desktop)</label>
                <div className="flex items-center gap-3">
                  <input data-target="desktop" type="file" accept="image/*" onChange={onFile} multiple />
                  {uploading && <span className="text-gray-500">Enviando...</span>}
                </div>
                {/* previews for uploaded desktop images (array) */}
                {Array.isArray(form.imageDesktopUrls) && form.imageDesktopUrls.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {form.imageDesktopUrls.map((u, i) => (
                      <div key={i} className="relative">
                        <img src={u} alt={`preview-${i}`} className="w-40 h-24 object-cover rounded" />
                        <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600" onClick={()=>{
                          setForm(f=>({ ...f, imageDesktopUrls: f.imageDesktopUrls.filter((x,idx)=>idx!==i) }));
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'mobile' && (
              <>
                <label className="label">Imagem (Mobile)</label>
                <div className="flex items-center gap-3">
                  <input data-target="mobile" type="file" accept="image/*" onChange={onFile} />
                  {uploading && <span className="text-gray-500">Enviando...</span>}
                </div>
                {form.imageMobileUrl && (
                  <img src={form.imageMobileUrl} alt="preview-mobile" className="mt-3 w-full h-24 object-cover rounded" />
                )}
              </>
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
              <div className="w-full md:w-64">
                {tab === 'desktop' && (
                  <div>
                    <label className="label text-sm">Desktop</label>
                    <img src={b.imageDesktopUrl || b.imageUrl} alt={b.title} className="w-full h-24 md:h-32 object-cover rounded" />
                    <div className="mt-2">
                      <input data-target="desktop" type="file" accept="image/*" onChange={async (e)=>{
                        const file = e.target.files?.[0]; if(!file) return; setUploading(true);
                        try{
                          const fd=new FormData(); fd.append('image', file); fd.append('target', 'desktop');
                          const { data } = await promosAPI.uploadImage(b._id, fd);
                          // backend returns updated banner; reload list
                          await load();
                        } finally{ setUploading(false); }
                      }} />
                    </div>
                  </div>
                )}

                {tab === 'mobile' && (
                  <div>
                    <label className="label text-sm">Mobile</label>
                    <img src={b.imageMobileUrl || b.imageUrl} alt={b.title} className="w-full h-24 md:h-32 object-cover rounded" />
                    <div className="mt-2">
                      <input data-target="mobile" type="file" accept="image/*" onChange={async (e)=>{
                        const file = e.target.files?.[0]; if(!file) return; setUploading(true);
                        try{
                          const fd=new FormData(); fd.append('image', file); fd.append('target', 'mobile');
                          const { data } = await promosAPI.uploadImage(b._id, fd);
                          await load();
                        } finally{ setUploading(false); }
                      }} />
                    </div>
                  </div>
                )}
              </div>
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
