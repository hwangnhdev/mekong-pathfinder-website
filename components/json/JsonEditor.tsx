import React, { useState, useRef } from 'react';
import { Upload, Clipboard, Trash2, Code, AlertTriangle, FileJson } from 'lucide-react';

interface JsonEditorProps {
  onRender: (parsedJson: any) => void;
  onClear: () => void;
}

const EXAMPLE_JSON = {
  distance: 8910.30,
  duration: 801.9,
  geometry: [
    { lat: 10.0123806, lng: 105.7324903 },
    { lat: 10.0182402, lng: 105.7351025 },
    { lat: 10.0245601, lng: 105.7428904 },
    { lat: 10.0310242, lng: 105.7564021 },
    { lat: 10.037062, lng: 105.784088 }
  ],
  instructions: [],
  snapped_waypoints: [
    { lat: 10.012532, lng: 105.732366 },
    { lat: 10.037062, lng: 105.784088 }
  ]
};

export default function JsonEditor({ onRender, onClear }: JsonEditorProps) {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('Không thể đọc dữ liệu từ clipboard.');
    }
  };

  const handleClear = () => {
    setJsonText('');
    setErrorMsg(null);
    onClear();
  };

  const handlePrettyFormat = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('JSON không hợp lệ để định dạng.');
    }
  };

  const parseAndRender = () => {
    setErrorMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('Vui lòng nhập dữ liệu JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const hasGeometry = parsed.geometry && Array.isArray(parsed.geometry) && parsed.geometry.length > 0;
      const hasRoutes = Array.isArray(parsed.routes) && parsed.routes.length > 0 && parsed.routes[0].geometry && Array.isArray(parsed.routes[0].geometry) && parsed.routes[0].geometry.length > 0;

      if (!hasGeometry && !hasRoutes) {
        setErrorMsg('Không tìm thấy cấu trúc tuyến đường hợp lệ (Yêu cầu trường "geometry" hoặc mảng "routes" có tọa độ).');
        return;
      }
      onRender(parsed);
    } catch (err) {
      setErrorMsg('Dữ liệu JSON không hợp lệ (Invalid Route JSON).');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setErrorMsg('Chỉ chấp nhận file định dạng .json.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('Đã có lỗi xảy ra khi đọc file.');
    };
    reader.readAsText(file);
  };

  const loadExample = () => {
    setJsonText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setErrorMsg(null);
  };

  return (
    <div className="space-y-4 font-sans text-left">
      {/* File Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg hover:shadow-primary/5"
        style={{
          borderColor: isDragOver ? 'var(--primary)' : 'var(--border)',
          backgroundColor: isDragOver ? 'var(--primary-dim)' : 'var(--bg)',
          color: 'var(--text)'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
             style={{ backgroundColor: 'var(--primary-dim)' }}>
          <Upload className="h-5 w-5 animate-pulse" style={{ color: 'var(--primary)' }} />
        </div>
        <p className="text-xs font-bold leading-normal">
          Kéo & thả file route .json vào đây
        </p>
        <span className="text-[10px] block mt-1" style={{ color: 'var(--text-muted)' }}>
          Hoặc click để chọn file từ máy tính
        </span>
      </div>

      {/* Editor Tool buttons (Unified toolbar) */}
      <div className="flex gap-2 justify-between items-center p-1.5 rounded-xl border" 
           style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex gap-1.5">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-neutral-800/10 transition cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text)'
            }}
            title="Dán từ Clipboard"
          >
            <Clipboard size={12} style={{ color: 'var(--primary)' }} /> Dán JSON
          </button>
          <button
            onClick={handlePrettyFormat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-neutral-800/10 transition cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text)'
            }}
            title="Định dạng thụt lề"
          >
            <Code size={12} style={{ color: 'var(--primary)' }} /> Định dạng
          </button>
        </div>
        
        <div className="flex gap-1.5 items-center">
          <button
            onClick={loadExample}
            className="px-2 py-1 text-xs transition cursor-pointer font-medium hover:text-neutral-200"
            style={{ color: 'var(--text-muted)' }}
          >
            Dùng mẫu
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-red-500/10 transition cursor-pointer border border-transparent hover:border-red-500/20"
            style={{
              color: '#ef4444'
            }}
            title="Xóa tất cả"
          >
            <Trash2 size={12} /> Xóa
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative rounded-xl overflow-hidden border focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300"
           style={{ borderColor: 'var(--border)' }}>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder={JSON.stringify(EXAMPLE_JSON, null, 2)}
          className="w-full h-64 font-mono text-xs p-3.5 focus:outline-none resize-y"
          style={{ 
            tabSize: 2,
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            lineHeight: '1.6'
          }}
        />
        <div className="absolute right-3.5 bottom-3.5 pointer-events-none flex items-center gap-1 opacity-50" style={{ color: 'var(--text-muted)' }}>
          <FileJson size={13} />
          <span className="text-[9px] font-mono font-bold">JSON</span>
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMsg && (
        <div className="border text-red-500 rounded-xl p-3 flex gap-2.5 items-start text-xs leading-normal animate-shake"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          <AlertTriangle className="flex-shrink-0 mt-0.5" size={14} style={{ color: '#ef4444' }} />
          <div>
            <strong className="font-bold block mb-0.5">Lỗi cú pháp JSON</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={parseAndRender}
        className="w-full py-3 font-bold rounded-xl text-sm tracking-wide uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg text-white"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          boxShadow: '0 4px 15px var(--primary-glow)'
        }}
      >
        Vẽ Lộ Trình (Render Route)
      </button>
    </div>
  );
}
