
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Play, 
  Download, 
  Info, 
  AlertCircle, 
  Loader2,
  Terminal as TerminalIcon,
  ChevronRight,
  Image as ImageIcon,
  Search,
  Filter
} from 'lucide-react';
import { ImageFile, SupportedFormat, AppState } from './types';
import { convertImage } from './services/converter';

const SUPPORTED_FORMATS: SupportedFormat[] = [
  "aai", "art", "ashlar", "avs", "bayer", "bgr", "bmp", "braille", "cals", "caption", "cin", "cip", "clip", "clipboard", "cmyk", "cube", "cut", "dcm", "dds", "debug", "dib", "djvu", "dmr", "dng", "dot", "dps", "dpx", "emf", "ept", "exr", "farbfeld", "fax", "fits", "fl32", "flif", "fpx", "ftxt", "gif", "gradient", "gray", "hald", "hdr", "heic", "histogram", "hrz", "html", "icon", "info", "inline", "ipl", "jbig", "jnx", "jp2", "jpeg", "json", "jxl", "kernel", "label", "mac", "magick", "map", "mask", "mat", "matte", "meta", "miff", "mono", "mpc", "mpr", "msl", "mtv", "mvg", "null", "ora", "otb", "palm", "pango", "pattern", "pcd", "pcl", "pcx", "pdb", "pdf", "pes", "pgx", "pict", "pix", "plasma", "png", "pnm", "ps", "ps2", "ps3", "psd", "pwp", "qoi", "raw", "rgb", "rgf", "rla", "rle", "scr", "screenshot", "sct", "sfw", "sgi", "sixel", "stegano", "strimg", "sun", "svg", "tga", "thumbnail", "tiff", "tile", "tim", "tim2", "ttf", "txt", "uhdr", "uil", "url", "uyvy", "vicar", "vid", "video", "viff", "vips", "wbmp", "webp", "wpg", "xbm", "xc", "xcf", "xpm", "xps", "yaml", "ycbcr", "yuv"
].sort();

export default function App() {
  const [state, setState] = useState<AppState>({
    images: [],
    verbose: false,
    isConverting: false,
    globalTargetFormat: 'webp',
    formatSearch: '',
    logs: ['[system] SIC initialized.', '[system] Ready for batch processing.'],
  });

  const filteredFormats = useMemo(() => {
    return SUPPORTED_FORMATS.filter(f => 
      f.toLowerCase().includes(state.formatSearch.toLowerCase())
    );
  }, [state.formatSearch]);

  const addLog = (msg: string) => {
    setState(prev => ({ ...prev, logs: [...prev.logs.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
      }));
      setState(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
      addLog(`Added ${newFiles.length} images to queue.`);
    }
  };

  const removeImage = (id: string) => {
    setState(prev => {
      const img = prev.images.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return { ...prev, images: prev.images.filter(i => i.id !== id) };
    });
  };

  const startBatchConversion = async () => {
    if (state.images.length === 0) return;

    setState(prev => ({ ...prev, isConverting: true }));
    addLog(`Target format: ${state.globalTargetFormat.toUpperCase()}`);

    const updatedImages = [...state.images];

    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      if (img.status === 'completed') continue;

      updatedImages[i] = { ...img, status: 'converting' };
      setState(prev => ({ ...prev, images: [...updatedImages] }));

      if (state.verbose) {
        addLog(`Processing ${img.file.name}...`);
      }

      try {
        const result = await convertImage(img.file, state.globalTargetFormat);
        
        if (result.blob.type !== `image/${state.globalTargetFormat}` && 
            !['png', 'jpeg', 'webp'].includes(state.globalTargetFormat)) {
          if (state.verbose) addLog(`Note: Browser used fallback mime ${result.blob.type} for exotic format ${state.globalTargetFormat}`);
        }

        updatedImages[i] = { 
          ...updatedImages[i], 
          status: 'completed', 
          resultUrl: result.url,
          targetFormat: state.globalTargetFormat 
        };
        addLog(`Converted: ${img.file.name}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        updatedImages[i] = { ...updatedImages[i], status: 'error', error: errorMsg };
        addLog(`Error: ${errorMsg} on ${img.file.name}`);
      }

      setState(prev => ({ ...prev, images: [...updatedImages] }));
    }

    setState(prev => ({ ...prev, isConverting: false }));
    addLog('Finished batch sequence. ✨');
  };

  const downloadAll = () => {
    state.images.forEach(img => {
      if (img.resultUrl) {
        const link = document.createElement('a');
        link.href = img.resultUrl;
        link.download = `converted_${img.file.name.split('.')[0]}.${img.targetFormat}`;
        link.click();
      }
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-3">
            <ImageIcon className="text-blue-400" />
            SIC
          </h1>
          <p className="text-slate-400 mt-1 font-medium tracking-wide">Simple Image Converter</p>
        </div>
        <div className="flex items-center gap-4 glass p-2 rounded-xl">
          <div className="flex flex-col items-end px-4">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Queue</span>
            <span className="text-xl font-mono text-blue-400">{state.images.length}</span>
          </div>
          <div className="h-10 w-[1px] bg-slate-700"></div>
          <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-2.5 rounded-lg font-semibold text-white">
            <Plus size={20} />
            Add Images
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        {/* Left Column: Settings & Console */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Controls */}
          <section className="glass p-6 rounded-2xl flex flex-col gap-5">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <ChevronRight size={18} className="text-blue-400" />
              Configuration
            </h2>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <Filter size={14} />
                  Output Format
                </label>
                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    className="bg-slate-900/80 border border-slate-700 rounded-lg py-1 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none transition-colors w-32"
                    value={state.formatSearch}
                    onChange={(e) => setState(p => ({ ...p, formatSearch: e.target.value }))}
                  />
                </div>
              </div>

              {/* Format List Grid */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-2 max-h-[260px] overflow-y-auto overflow-x-hidden scrollbar-thin">
                <div className="grid grid-cols-3 gap-1.5">
                  {filteredFormats.map(f => (
                    <button
                      key={f}
                      title={f.toUpperCase()}
                      onClick={() => setState(p => ({ ...p, globalTargetFormat: f }))}
                      className={`py-3 px-0.5 rounded-md text-[10px] font-bold transition-all border flex items-center justify-center truncate ${
                        state.globalTargetFormat === f 
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]' 
                          : 'bg-slate-800/30 text-slate-500 border-transparent hover:bg-slate-800/60 hover:text-slate-400'
                      }`}
                    >
                      <span className="truncate w-full px-1">{f.toUpperCase()}</span>
                    </button>
                  ))}
                  {filteredFormats.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-slate-600 italic">
                      No matching formats
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center italic">
                Note: Native browser support varies by format.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200">Verbose Output</span>
                <span className="text-xs text-slate-500">Log every single action</span>
              </div>
              <button 
                onClick={() => setState(p => ({ ...p, verbose: !p.verbose }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${state.verbose ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${state.verbose ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <button
              disabled={state.images.length === 0 || state.isConverting}
              onClick={startBatchConversion}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20 transition-all"
            >
              {state.isConverting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
              {state.isConverting ? 'Processing...' : 'Run Magick Batch'}
            </button>
          </section>

          {/* Terminal (Visible only when verbose is on) */}
          {state.verbose && (
            <section className="glass rounded-2xl overflow-hidden flex flex-col h-[300px]">
              <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
                  <TerminalIcon size={14} />
                  System Console
                </div>
                <button onClick={() => setState(p => ({ ...p, logs: [] }))} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
              </div>
              <div className="p-4 font-mono text-xs overflow-y-auto flex flex-col gap-1 bg-slate-950/40 flex-grow">
                {state.logs.map((log, i) => (
                  <div key={i} className={`whitespace-pre-wrap ${
                    log.includes('Error') ? 'text-rose-400' : 
                    log.includes('Successfully') ? 'text-emerald-400' : 
                    log.includes('[system]') ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    <span className="opacity-40 mr-2 text-slate-600">{i + 1}</span>
                    {log}
                  </div>
                ))}
                <div id="log-end"></div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Image List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Queue
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{state.images.length} items</span>
            </h2>
            {state.images.some(i => i.status === 'completed') && (
              <button onClick={downloadAll} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors">
                <Download size={18} />
                Download All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.images.length === 0 ? (
              <label className="col-span-full h-64 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-4 cursor-pointer hover:border-blue-500/50 hover:bg-slate-800/20 transition-all group">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={32} className="opacity-20 group-hover:opacity-40" />
                </div>
                <p className="group-hover:text-slate-400 transition-colors px-6 text-center">No images in queue. Click here or 'Add Images' to begin.</p>
              </label>
            ) : (
              state.images.map(img => (
                <div key={img.id} className="glass rounded-2xl p-4 flex flex-col gap-4 group hover:border-blue-500/30 transition-all">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-slate-200 truncate">{img.file.name}</h3>
                      <p className="text-xs text-slate-500 uppercase">
                        {(img.file.size / 1024).toFixed(1)} KB • {img.file.type.split('/')[1]}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {img.status === 'pending' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold uppercase tracking-wider">Waiting</span>}
                        {img.status === 'converting' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider animate-pulse">Converting</span>}
                        {img.status === 'completed' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">Finished</span>}
                        {img.status === 'error' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold uppercase tracking-wider">Failed</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        disabled={state.isConverting}
                        onClick={() => removeImage(img.id)} 
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {img.status === 'completed' && img.resultUrl && (
                    <div className="flex items-center justify-between p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <span className="text-xs text-emerald-400 font-medium">Shift Complete</span>
                      <a href={img.resultUrl} download={`converted_${img.file.name.split('.')[0]}.${img.targetFormat}`} className="flex items-center gap-2 text-xs text-emerald-100 font-bold hover:underline">
                        <Download size={14} />
                        Download .{img.targetFormat?.toUpperCase()}
                      </a>
                    </div>
                  )}

                  {img.status === 'error' && (
                    <div className="p-2 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-400" />
                      <span className="text-xs text-rose-400 truncate">{img.error}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center py-8 text-slate-500 text-sm flex flex-col items-center gap-2 border-t border-slate-900 mt-auto">
        <p className="font-mono text-[10px] opacity-30 uppercase tracking-[0.2em]">SIC Web UI v1.0.0 Stable</p>
      </footer>
    </div>
  );
}
