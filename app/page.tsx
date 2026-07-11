"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wand2, 
  Sparkles, 
  Upload,
  Download,
  Settings2,
  RefreshCcw,
  Scissors,
  ImageIcon,
  Loader2,
  SlidersHorizontal,
  Crop as CropIcon,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo,
  Redo,
  ArrowRight,
  Zap,
  Layers,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import Image from "next/image";
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type Tool = "landing" | "generate" | "bg-remove" | "enhance" | "edit";

export default function Page() {
  const [activeTool, setActiveTool] = useState<Tool>("landing");

  if (activeTool === "landing") {
    return <LandingPage onEnter={setActiveTool} />;
  }

  return (
    <div className="w-full h-screen bg-[#020203] text-slate-200 font-sans flex overflow-hidden select-none">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-72 border-r border-white/10 bg-[#050507] flex flex-col z-20"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.4)] mr-3">
              <div className="w-3 h-3 bg-white/20 rounded-sm rotate-45 border border-white/40"></div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LENS<span className="text-indigo-400">FORGE</span></span>
          </div>
          <button 
            onClick={() => setActiveTool("landing")}
            className="text-slate-500 hover:text-white transition-colors"
            title="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block mb-4 mt-2 px-2">Studio Tools</label>
          
          <ToolButton 
            icon={<Wand2 size={18} />} 
            label="AI Image Generator" 
            active={activeTool === "generate"} 
            onClick={() => setActiveTool("generate")} 
          />
          <ToolButton 
            icon={<Scissors size={18} />} 
            label="Background Remover" 
            active={activeTool === "bg-remove"} 
            onClick={() => setActiveTool("bg-remove")} 
          />
          <ToolButton 
            icon={<Sparkles size={18} />} 
            label="Face Enhancer" 
            active={activeTool === "enhance"} 
            onClick={() => setActiveTool("enhance")} 
          />
          <ToolButton 
            icon={<SlidersHorizontal size={18} />} 
            label="Photo Editor" 
            active={activeTool === "edit"} 
            onClick={() => setActiveTool("edit")} 
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
            <Settings2 size={18} />
            <span>Preferences</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Workspace */}
      <main className="flex-1 bg-[#08080a] relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTool === "generate" && <ImageGenerator key="generate" />}
          {activeTool === "bg-remove" && <BackgroundRemover key="bg-remove" />}
          {activeTool === "enhance" && <FaceEnhancer key="enhance" />}
          {activeTool === "edit" && <PhotoEditor key="edit" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-medium ${
        active 
          ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]" 
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-auto shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
      )}
    </button>
  );
}

// -----------------------------------------------------------------------------
// AI Image Generator Component
// -----------------------------------------------------------------------------
function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Generation failed");
      
      setResultImage(data.image);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex flex-col p-8 gap-6 h-full"
    >
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-light text-white flex items-center gap-3">
            <Wand2 className="text-indigo-400" /> AI Image Generator
          </h2>
          <p className="text-slate-400 text-sm mt-1">Transform text descriptions into high-quality images.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Controls */}
        <div className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
          <div className="space-y-3">
            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {["1:1", "16:9", "9:16", "4:3", "3:4"].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 text-xs font-mono rounded-lg border transition-all ${
                    aspectRatio === ratio 
                      ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 mt-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(79,70,229,0.3)] border border-white/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-black/50 relative flex items-center justify-center overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent pointer-events-none"></div>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center text-indigo-400 gap-4">
              <div className="w-12 h-12 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
              <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Rendering Image...</span>
            </div>
          ) : resultImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img 
                src={resultImage} 
                alt="Generated" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = resultImage;
                    a.download = `lensforge-${Date.now()}.png`;
                    a.click();
                  }}
                  className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="text-rose-400 text-sm max-w-md text-center p-6 border border-rose-500/20 bg-rose-500/10 rounded-xl">
              <p className="font-bold mb-1">Generation Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          ) : (
             <div className="text-slate-600 flex flex-col items-center gap-3">
               <ImageIcon size={48} className="opacity-20" />
               <span className="text-sm font-medium">Ready to generate</span>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Background Remover Component (Mocked)
// -----------------------------------------------------------------------------
function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setOriginalUrl(url);
      setPreviewUrl(url);
      setProcessed(false);
      setSliderPosition(50);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleProcess = async () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);
    
    try {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = originalUrl;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        // Mock effect: make light pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) {
            data[i+3] = 0; 
          }
        }
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            setPreviewUrl(URL.createObjectURL(blob));
            setProcessed(true);
          }
          setIsProcessing(false);
        }, "image/png");
      };
      
      img.onerror = () => {
        setIsProcessing(false);
        setProcessed(true);
      };
    } catch (error) {
      console.error("Background removal error:", error);
      alert("Failed to remove background. See console for details.");
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex flex-col p-8 gap-6 h-full"
    >
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-light text-white flex items-center gap-3">
            <Scissors className="text-indigo-400" /> Background Remover
          </h2>
          <p className="text-slate-400 text-sm mt-1">Instantly cut out subjects from their backgrounds with precision.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Controls */}
        <div className="w-80 flex flex-col gap-6 shrink-0 pr-2">
          <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-indigo-500/30 hover:bg-white/5 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <Upload className="text-slate-500 mb-3" size={32} />
            <p className="text-sm text-slate-300 font-medium">Click to upload image</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
          </div>
          
          <button 
            onClick={handleProcess}
            disabled={!file || isProcessing || processed}
            className="w-full py-4 mt-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(79,70,229,0.3)] border border-white/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
            {isProcessing ? "Processing..." : "Remove Background"}
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-black/50 relative flex items-center justify-center overflow-hidden">
          {/* Checkerboard background for transparency effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNjY2MiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNjY2MiLz4KPC9zdmc+')", backgroundSize: "20px 20px" }}></div>
          
          {isProcessing ? (
             <div className="flex flex-col items-center justify-center text-indigo-400 gap-4 z-10">
               <div className="w-12 h-12 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
               <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Extracting Subject...</span>
             </div>
          ) : processed && previewUrl && originalUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 z-10">
               <div 
                 className="relative flex items-center justify-center w-full h-full max-w-full select-none cursor-ew-resize"
                 ref={sliderRef}
                 onPointerDown={(e) => {
                   setIsDragging(true);
                   e.currentTarget.setPointerCapture(e.pointerId);
                   handlePointerMove(e);
                 }}
                 onPointerMove={handlePointerMove}
                 onPointerUp={(e) => {
                   setIsDragging(false);
                   e.currentTarget.releasePointerCapture(e.pointerId);
                 }}
                 onPointerCancel={(e) => {
                   setIsDragging(false);
                   e.currentTarget.releasePointerCapture(e.pointerId);
                 }}
               >
                 <div className="relative w-fit h-full flex items-center justify-center">
                   {/* Original Image (Background) */}
                   <img src={originalUrl} alt="Original" className="max-h-full object-contain rounded-lg pointer-events-none" />
                   
                   {/* Enhanced Image (Clipped overlay) */}
                   <div 
                     className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
                     style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                   >
                     <img src={previewUrl} alt="Removed Background" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                   </div>

                   {/* Slider Handle */}
                   <div 
                     className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
                     style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                   >
                     <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg text-black font-bold text-[8px] tracking-tighter">
                       <span className="block w-0.5 h-3 bg-slate-300 mx-0.5 rounded-full"></span>
                       <span className="block w-0.5 h-3 bg-slate-300 mx-0.5 rounded-full"></span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement('a');
                        a.href = previewUrl;
                        a.download = `lensforge-bg-removed-${Date.now()}.png`;
                        a.click();
                      }}
                      className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
                      title="Download image"
                    >
                      <Download size={18} />
                    </button>
                 </div>
               </div>
               <div className="absolute bottom-6 flex gap-8 font-mono text-[10px] tracking-widest text-white/50 z-20 pointer-events-none">
                 <span className={`${sliderPosition < 50 ? 'text-white' : ''}`}>BEFORE</span>
                 <span className={`${sliderPosition > 50 ? 'text-white' : ''}`}>AFTER</span>
               </div>
            </div>
          ) : originalUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-4 z-10">
              <img src={originalUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center gap-3 z-10">
               <ImageIcon size={48} className="opacity-20" />
               <span className="text-sm font-medium">Upload an image to start</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Face Enhancer Component (Mocked)
// -----------------------------------------------------------------------------
function FaceEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [strength, setStrength] = useState(50);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setOriginalUrl(url);
      setPreviewUrl(url);
      setProcessed(false);
      setSliderPosition(50);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const [colorCorrect, setColorCorrect] = useState(true);

  const handleProcess = () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = originalUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Simple sharpening convolution matrix
      const mix = strength / 100;
      if (mix > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width;
        const h = canvas.height;
        const output = new Uint8ClampedArray(data.length);
        
        const sharp = mix * 2;
        const center = 1 + 4 * sharp;
        const matrix = [
          0, -sharp, 0,
          -sharp, center, -sharp,
          0, -sharp, 0
        ];

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              let val = 
                data[i - w * 4 + c] * matrix[1] +
                data[i - 4 + c] * matrix[3] +
                data[i + c] * matrix[4] +
                data[i + 4 + c] * matrix[5] +
                data[i + w * 4 + c] * matrix[7];
              output[i + c] = val;
            }
            output[i + 3] = data[i + 3];
          }
        }
        
        // Copy processed back, leaving edges intact for simplicity
        for (let i = 0; i < data.length; i += 4) {
          if (output[i+3] > 0) {
            data[i] = output[i];
            data[i+1] = output[i+1];
            data[i+2] = output[i+2];
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Apply color correction via CSS filter on canvas then re-draw
      if (colorCorrect) {
        const offscreen = document.createElement("canvas");
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offCtx = offscreen.getContext("2d");
        if (offCtx) {
          const contrast = 1 + (strength / 200);
          const saturate = 1 + (strength / 200);
          offCtx.filter = `contrast(${contrast}) saturate(${saturate})`;
          offCtx.drawImage(canvas, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(offscreen, 0, 0);
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setProcessed(true);
        }
        setIsProcessing(false);
      }, "image/jpeg", 0.95);
    };

    img.onerror = () => {
      setIsProcessing(false);
      alert("Failed to process image.");
    };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex flex-col p-8 gap-6 h-full"
    >
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-light text-white flex items-center gap-3">
            <Sparkles className="text-indigo-400" /> Face Enhancer
          </h2>
          <p className="text-slate-400 text-sm mt-1">Restore details, fix blurry faces, and enhance portraits (Local Processing).</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Controls */}
        <div className="w-80 flex flex-col gap-6 shrink-0 pr-2 overflow-y-auto">
          <div className="h-32 shrink-0 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 text-center hover:border-indigo-500/30 hover:bg-white/5 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <Upload className="text-slate-500 mb-2" size={24} />
            <p className="text-sm text-slate-300 font-medium">Upload portrait</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] mb-2 font-mono uppercase tracking-widest text-slate-500">
                <span>Enhancement Strength</span>
                <span className="text-indigo-400">{strength}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={strength}
                onChange={(e) => setStrength(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input 
                type="checkbox" 
                id="color-correct" 
                className="accent-indigo-500 w-4 h-4 rounded" 
                checked={colorCorrect}
                onChange={(e) => setColorCorrect(e.target.checked)}
              />
              <label htmlFor="color-correct" className="text-sm text-slate-300">Auto Color Correction</label>
            </div>
          </div>

          <button 
            onClick={handleProcess}
            disabled={!file || isProcessing || processed}
            className="w-full py-4 mt-auto shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(79,70,229,0.3)] border border-white/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isProcessing ? "Enhancing..." : "Enhance Face"}
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-black/50 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none"></div>
          
          {isProcessing ? (
             <div className="flex flex-col items-center justify-center text-indigo-400 gap-4 z-10">
               <div className="w-12 h-12 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
               <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Running Enhancement...</span>
             </div>
          ) : processed && previewUrl && originalUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 z-10">
               <div 
                 className="relative flex items-center justify-center w-full h-full max-w-full select-none cursor-ew-resize"
                 ref={sliderRef}
                 onPointerDown={(e) => {
                   setIsDragging(true);
                   e.currentTarget.setPointerCapture(e.pointerId);
                   handlePointerMove(e);
                 }}
                 onPointerMove={handlePointerMove}
                 onPointerUp={(e) => {
                   setIsDragging(false);
                   e.currentTarget.releasePointerCapture(e.pointerId);
                 }}
                 onPointerCancel={(e) => {
                   setIsDragging(false);
                   e.currentTarget.releasePointerCapture(e.pointerId);
                 }}
               >
                 <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl absolute pointer-events-none opacity-50" />
                 <div className="relative w-fit h-full flex items-center justify-center">
                   {/* Original Image (Background) */}
                   <img src={originalUrl} alt="Original" className="max-h-full object-contain rounded-lg pointer-events-none" />
                   
                   {/* Enhanced Image (Clipped overlay) */}
                   <div 
                     className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
                     style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                   >
                     <img src={previewUrl} alt="Enhanced" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                   </div>

                   {/* Slider Handle */}
                   <div 
                     className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
                     style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                   >
                     <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg text-black font-bold text-[8px] tracking-tighter">
                       <span className="block w-0.5 h-3 bg-slate-300 mx-0.5 rounded-full"></span>
                       <span className="block w-0.5 h-3 bg-slate-300 mx-0.5 rounded-full"></span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const a = document.createElement('a');
                        a.href = previewUrl;
                        a.download = `lensforge-enhanced-${Date.now()}.jpg`;
                        a.click();
                      }}
                      className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
                      title="Download image"
                    >
                      <Download size={18} />
                    </button>
                 </div>
               </div>
               <div className="absolute bottom-6 flex gap-8 font-mono text-[10px] tracking-widest text-white/50 z-20 pointer-events-none">
                 <span className={`${sliderPosition < 50 ? 'text-white' : ''}`}>BEFORE</span>
                 <span className={`${sliderPosition > 50 ? 'text-white' : ''}`}>AFTER</span>
               </div>
            </div>
          ) : originalUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-4 z-10">
              <img src={originalUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center gap-3 z-10">
               <ImageIcon size={48} className="opacity-20" />
               <span className="text-sm font-medium">Upload a portrait to start</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Photo Editor
// -----------------------------------------------------------------------------
function PhotoEditor() {
  type HistoryState = {
    brightness: number;
    contrast: number;
    saturation: number;
    sepia: number;
    blur: number;
    hue: number;
    invert: number;
    grayscale: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
    originalUrl: string;
  };

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [invert, setInvert] = useState(0);
  const [grayscale, setGrayscale] = useState(0);

  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const stateRef = useRef<HistoryState>({
    brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0, hue: 0, invert: 0, grayscale: 0, rotation: 0, flipH: false, flipV: false, originalUrl: ""
  });

  // Keep ref in sync
  React.useEffect(() => {
    stateRef.current = { brightness, contrast, saturation, sepia, blur, hue, invert, grayscale, rotation, flipH, flipV, originalUrl: originalUrl || "" };
  }, [brightness, contrast, saturation, sepia, blur, hue, invert, grayscale, rotation, flipH, flipV, originalUrl]);

  const commitHistory = (state: HistoryState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, state];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleSliderUp = () => {
    if (historyIndex >= 0) {
      const lastHistory = history[historyIndex];
      const current = stateRef.current;
      if (
        lastHistory.brightness === current.brightness &&
        lastHistory.contrast === current.contrast &&
        lastHistory.saturation === current.saturation &&
        lastHistory.sepia === current.sepia &&
        lastHistory.blur === current.blur &&
        lastHistory.hue === current.hue &&
        lastHistory.invert === current.invert &&
        lastHistory.grayscale === current.grayscale
      ) {
        return; 
      }
    }
    commitHistory(stateRef.current);
  };

  const restoreState = (state: HistoryState) => {
    setBrightness(state.brightness);
    setContrast(state.contrast);
    setSaturation(state.saturation);
    setSepia(state.sepia);
    setBlur(state.blur);
    setHue(state.hue);
    setInvert(state.invert);
    setGrayscale(state.grayscale);
    setRotation(state.rotation);
    setFlipH(state.flipH);
    setFlipV(state.flipV);
    setOriginalUrl(state.originalUrl);
  };

  const updateAndCommitState = (updates: Partial<HistoryState>) => {
    const nextState = { ...stateRef.current, ...updates };
    restoreState(nextState);
    commitHistory(nextState);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      restoreState(prevState);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      restoreState(nextState);
    }
  };

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [isCropping, setIsCropping] = useState(false);

  const histogramCanvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!originalUrl) return;
    
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = originalUrl;
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      const maxSize = 256;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxSize || h > maxSize) {
        if (w > h) {
          h = Math.round((h * maxSize) / w);
          w = maxSize;
        } else {
          w = Math.round((w * maxSize) / h);
          h = maxSize;
        }
      }
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hue}deg) invert(${invert}%) grayscale(${grayscale}%)`;
      ctx.drawImage(img, 0, 0, w, h);
      
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const bins = new Array(256).fill(0);
      let maxCount = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        if (a < 128) continue; 
        
        const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
        bins[Math.min(255, Math.max(0, lum))]++;
        if (bins[Math.min(255, Math.max(0, lum))] > maxCount) {
          maxCount = bins[Math.min(255, Math.max(0, lum))];
        }
      }
      
      const histCanvas = histogramCanvasRef.current;
      if (!histCanvas) return;
      const histCtx = histCanvas.getContext("2d");
      if (!histCtx) return;
      
      const width = histCanvas.width;
      const height = histCanvas.height;
      
      histCtx.clearRect(0, 0, width, height);
      histCtx.fillStyle = 'rgba(99, 102, 241, 0.8)';
      
      for (let i = 0; i < 256; i++) {
        const count = bins[i];
        const hVal = maxCount > 0 ? (count / maxCount) * height : 0;
        histCtx.fillRect((i / 256) * width, height - hVal, Math.ceil(width / 256), hVal);
      }
    };
  }, [originalUrl, brightness, contrast, saturation, sepia, blur, hue, invert, grayscale]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const url = URL.createObjectURL(selected);
      setFile(selected);
      setOriginalUrl(url);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setSepia(0);
      setBlur(0);
      setHue(0);
      setInvert(0);
      setGrayscale(0);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setAspect(undefined);
      setIsCropping(false);
      
      const initialState = {
        brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0, hue: 0, invert: 0, grayscale: 0, rotation: 0, flipH: false, flipV: false, originalUrl: url
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  };

  const handleApplyCrop = () => {
    if (!originalUrl || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0 || !imgRef.current) return;
    
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = originalUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scaleX = img.naturalWidth / imgRef.current!.width;
      const scaleY = img.naturalHeight / imgRef.current!.height;
      const sourceX = completedCrop.x * scaleX;
      const sourceY = completedCrop.y * scaleY;
      const sourceWidth = completedCrop.width * scaleX;
      const sourceHeight = completedCrop.height * scaleY;

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      
      ctx.drawImage(
        img, 
        sourceX, 
        sourceY, 
        sourceWidth, 
        sourceHeight, 
        0, 
        0, 
        sourceWidth, 
        sourceHeight
      );
      
      const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setIsCropping(false);
      updateAndCommitState({ originalUrl: dataUrl });
    };
  };

  const handleDownload = () => {
    if (!originalUrl) return;
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = originalUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.naturalWidth;
      let sourceHeight = img.naturalHeight;

      if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
        const scaleX = img.naturalWidth / imgRef.current.width;
        const scaleY = img.naturalHeight / imgRef.current.height;
        sourceX = completedCrop.x * scaleX;
        sourceY = completedCrop.y * scaleY;
        sourceWidth = completedCrop.width * scaleX;
        sourceHeight = completedCrop.height * scaleY;
      }

      const isRotated = rotation % 180 !== 0;
      canvas.width = isRotated ? sourceHeight : sourceWidth;
      canvas.height = isRotated ? sourceWidth : sourceHeight;
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hue}deg) invert(${invert}%) grayscale(${grayscale}%)`;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(
        img, 
        sourceX, 
        sourceY, 
        sourceWidth, 
        sourceHeight, 
        -sourceWidth / 2, 
        -sourceHeight / 2, 
        sourceWidth, 
        sourceHeight
      );
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `lensforge-edited-${Date.now()}.jpg`;
      a.click();
    };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex flex-col md:flex-row"
    >
      {/* Left Sidebar - Settings */}
      <div className="w-full md:w-80 border-r border-white/10 bg-[#0a0a0c] flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase mb-1">Photo Editor</h2>
          <p className="text-xs text-slate-400">Adjust properties & filters</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {!file ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
              >
                <Upload size={18} />
                Upload Photo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 pb-5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white tracking-widest uppercase">Crop & Ratio</label>
                    <button 
                      onClick={() => {
                        if (isCropping) {
                          setCrop(undefined);
                          setCompletedCrop(undefined);
                          setAspect(undefined);
                        }
                        setIsCropping(!isCropping);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${isCropping ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      <CropIcon size={14} />
                    </button>
                  </div>
                  {isCropping && (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => setAspect(undefined)} className={`text-xs py-1.5 rounded-md font-medium transition-colors ${aspect === undefined ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Free</button>
                        <button onClick={() => setAspect(1)} className={`text-xs py-1.5 rounded-md font-medium transition-colors ${aspect === 1 ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>1:1</button>
                        <button onClick={() => setAspect(4/5)} className={`text-xs py-1.5 rounded-md font-medium transition-colors ${aspect === 4/5 ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>4:5</button>
                        <button onClick={() => setAspect(16/9)} className={`text-xs py-1.5 rounded-md font-medium transition-colors ${aspect === 16/9 ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>16:9</button>
                      </div>
                      <button 
                        onClick={handleApplyCrop}
                        disabled={!completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0}
                        className="w-full mt-2 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-all flex items-center justify-center"
                      >
                        Apply Crop
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 pb-5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white tracking-widest uppercase">Transform</label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => updateAndCommitState({ rotation: (rotation - 90) % 360 })} className="flex items-center justify-center p-2 rounded-md bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors" title="Rotate Left">
                      <RotateCcw size={16} />
                    </button>
                    <button onClick={() => updateAndCommitState({ rotation: (rotation + 90) % 360 })} className="flex items-center justify-center p-2 rounded-md bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors" title="Rotate Right">
                      <RotateCw size={16} />
                    </button>
                    <button onClick={() => updateAndCommitState({ flipH: !flipH })} className={`flex items-center justify-center p-2 rounded-md transition-colors ${flipH ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`} title="Flip Horizontal">
                      <FlipHorizontal size={16} />
                    </button>
                    <button onClick={() => updateAndCommitState({ flipV: !flipV })} className={`flex items-center justify-center p-2 rounded-md transition-colors ${flipV ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`} title="Flip Vertical">
                      <FlipVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Brightness</label>
                    <span className="text-xs text-indigo-400 font-mono">{brightness}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Contrast</label>
                    <span className="text-xs text-indigo-400 font-mono">{contrast}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Saturation</label>
                    <span className="text-xs text-indigo-400 font-mono">{saturation}%</span>
                  </div>
                  <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Sepia</label>
                    <span className="text-xs text-indigo-400 font-mono">{sepia}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={sepia} onChange={e => setSepia(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Blur</label>
                    <span className="text-xs text-indigo-400 font-mono">{blur}px</span>
                  </div>
                  <input type="range" min="0" max="20" value={blur} onChange={e => setBlur(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Hue Rotate</label>
                    <span className="text-xs text-indigo-400 font-mono">{hue}°</span>
                  </div>
                  <input type="range" min="0" max="360" value={hue} onChange={e => setHue(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Invert</label>
                    <span className="text-xs text-indigo-400 font-mono">{invert}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={invert} onChange={e => setInvert(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-slate-400">Grayscale</label>
                    <span className="text-xs text-indigo-400 font-mono">{grayscale}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={grayscale} onChange={e => setGrayscale(Number(e.target.value))} onPointerUp={handleSliderUp} onTouchEnd={handleSliderUp} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-white tracking-widest uppercase">Luminosity Histogram</label>
                </div>
                <canvas 
                  ref={histogramCanvasRef} 
                  width={256} 
                  height={100} 
                  className="w-full h-24 bg-black/40 rounded-lg border border-white/5"
                />
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-white/10">
                <button 
                  onClick={() => {
                    updateAndCommitState({
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      sepia: 0,
                      blur: 0,
                      hue: 0,
                      invert: 0,
                      grayscale: 0,
                      rotation: 0,
                      flipH: false,
                      flipV: false
                    });
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                    setAspect(undefined);
                    setIsCropping(false);
                  }}
                  className="w-full h-10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/5"
                >
                  <RefreshCcw size={16} />
                  Reset Filters
                </button>
                <button 
                  onClick={() => {
                    setFile(null);
                    setOriginalUrl(null);
                  }}
                  className="w-full h-10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Upload New Image
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Content - Preview */}
      <div className="flex-1 relative bg-black/40 flex items-center justify-center overflow-hidden p-8">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {originalUrl ? (
            <div className="relative flex items-center justify-center w-full h-full z-10 p-12">
               {isCropping ? (
                 <ReactCrop
                   crop={crop}
                   onChange={(c) => setCrop(c)}
                   onComplete={(c) => setCompletedCrop(c)}
                   aspect={aspect}
                   className="shadow-2xl rounded-lg"
                   style={{ transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`, transition: 'transform 0.1s' }}
                 >
                   <img 
                     ref={imgRef}
                     src={originalUrl} 
                     alt="Preview" 
                     className="block max-w-full rounded-lg" 
                     style={{ 
                       filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hue}deg) invert(${invert}%) grayscale(${grayscale}%)`, 
                       maxHeight: 'calc(100vh - 12rem)'
                     }}
                   />
                 </ReactCrop>
               ) : (
                 <img 
                   ref={imgRef}
                   src={originalUrl} 
                   alt="Preview" 
                   className="block max-w-full rounded-lg shadow-2xl transition-all duration-75" 
                   style={{ 
                     filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hue}deg) invert(${invert}%) grayscale(${grayscale}%)`,
                     transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                     maxHeight: 'calc(100vh - 12rem)'
                   }}
                 />
               )}
               <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <button 
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <Undo size={18} />
                  </button>
                  <button 
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <Redo size={18} />
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-2 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-md border border-white/10 transition-colors"
                    title="Download Image"
                  >
                    <Download size={18} />
                  </button>
               </div>
            </div>
          ) : (
            <div className="text-slate-600 flex flex-col items-center gap-3 z-10">
              <ImageIcon size={48} className="opacity-20" />
              <span className="text-sm font-medium">Upload a photo to edit</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LandingPage({ onEnter }: { onEnter: (tool: Tool) => void }) {
  return (
    <div className="w-full min-h-screen bg-[#020203] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-y-auto">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-20 border-b border-white/5 bg-[#020203]/80 backdrop-blur-md z-50 flex items-center justify-between px-8 md:px-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <div className="w-4 h-4 bg-white/20 rounded-sm rotate-45 border border-white/40"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LENS<span className="text-indigo-400">FORGE</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <button onClick={() => onEnter("generate")} className="hover:text-white transition-colors">Studio</button>
        </nav>
        <button onClick={() => onEnter("generate")} className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-slate-200 transition-colors">
          Open Studio
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 md:px-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8">
            <Sparkles size={14} />
            <span>Next-Generation AI Vision</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
            Forge the Impossible <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">With Intelligent Pixels</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Unleash your creativity with Lensforge. Generate, edit, enhance, and manipulate images using cutting-edge artificial intelligence, directly from your browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onEnter("generate")} 
              className="group relative flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition-all active:scale-95"
            >
              <span>Start Generating</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onEnter("edit")} 
              className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all active:scale-95"
            >
              <SlidersHorizontal size={18} />
              <span>Photo Editor</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Grid Services Section */}
      <section id="services" className="py-24 px-8 md:px-16 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Core Capabilities</h2>
            <p className="text-slate-400 max-w-lg">A complete suite of AI-powered creative tools designed for speed, precision, and imagination.</p>
          </div>
          <button onClick={() => onEnter("generate")} className="text-indigo-400 font-medium flex items-center gap-1 hover:text-indigo-300 transition-colors mx-auto md:mx-0">
            <span>Explore all tools</span>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <ServiceCard 
            icon={<Wand2 size={24} />}
            title="Text-to-Image Generation"
            description="Turn your wildest descriptions into high-fidelity visuals instantly using our advanced AI generation models."
            gradient="from-indigo-500/20 to-purple-500/20"
            iconColor="text-indigo-400"
            onClick={() => onEnter("generate")}
          />
          
          {/* Card 2 */}
          <ServiceCard 
            icon={<Scissors size={24} />}
            title="AI Background Removal"
            description="Extract subjects with pixel-perfect precision. Remove distracting backgrounds from any photo in seconds."
            gradient="from-cyan-500/20 to-blue-500/20"
            iconColor="text-cyan-400"
            onClick={() => onEnter("bg-remove")}
          />

          {/* Card 3 */}
          <ServiceCard 
            icon={<Sparkles size={24} />}
            title="Face & Detail Enhancer"
            description="Upscale blurry portraits, restore old photos, and enhance facial features with stunning clarity."
            gradient="from-emerald-500/20 to-teal-500/20"
            iconColor="text-emerald-400"
            onClick={() => onEnter("enhance")}
          />

          {/* Card 4 */}
          <ServiceCard 
            icon={<SlidersHorizontal size={24} />}
            title="Pro Photo Editor"
            description="Fine-tune exposure, color, contrast, and apply advanced transformations directly within the platform."
            gradient="from-amber-500/20 to-orange-500/20"
            iconColor="text-amber-400"
            onClick={() => onEnter("edit")}
          />
          
          {/* Card 5 */}
          <ServiceCard 
            icon={<Layers size={24} />}
            title="Batch Processing"
            description="Apply filters, watermarks, or background removals to multiple files simultaneously."
            gradient="from-pink-500/20 to-rose-500/20"
            iconColor="text-pink-400"
            onClick={() => onEnter("generate")} 
          />

          {/* Card 6 */}
          <ServiceCard 
            icon={<Zap size={24} />}
            title="Lightning Fast"
            description="Built on edge computing and optimized WebGL for real-time rendering and instant feedback."
            gradient="from-yellow-500/20 to-amber-500/20"
            iconColor="text-yellow-400"
            onClick={() => onEnter("generate")} 
          />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Lensforge. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, description, gradient, iconColor, onClick }: { icon: React.ReactNode, title: string, description: string, gradient: string, iconColor: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative h-full bg-[#050507] rounded-2xl p-8 flex flex-col items-start gap-4 backdrop-blur-sm z-10 border border-transparent group-hover:border-white/5 transition-colors">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
          <span>Try it out</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
