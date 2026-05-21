import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAudioUpload } from '../hooks/useAudioUpload';

export default function AudioUpload() {
  const navigate = useNavigate();
  const { upload, uploading, error } = useAudioUpload();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateFile = (selectedFile: File) => {
    setFileError('');

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'];
    const validExtensions = /\.(mp3|wav|m4a|mp4)$/i;

    if (!validTypes.includes(selectedFile.type) && !validExtensions.test(selectedFile.name)) {
      setFileError('Please select a valid audio file (mp3, wav, m4a, mp4)');
      return false;
    }

    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setFileError('File size must be less than 100MB');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setFileError('Please select an audio file');
      return;
    }

    try {
      const response = await upload(file);
      navigate(`/sessions/${response.session_id}`);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Creating Memories
              </h1>
              <p className="text-slate-400 mt-1">Transform audio into searchable memories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className={`bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <form onSubmit={handleSubmit} className="p-8">
            {/* File Upload Area */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-white mb-4">
                Audio File
              </label>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-purple-400 bg-purple-500/10 scale-105'
                    : file
                    ? 'border-green-400/50 bg-green-500/5'
                    : 'border-purple-500/30 hover:border-purple-400/50 bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />

                <div className="flex flex-col items-center">
                  {file ? (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold text-white mb-2">{file.name}</p>
                      <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                        <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-xl font-semibold text-white mb-2">Drop your audio file here</p>
                      <p className="text-slate-400 mb-4">or click to browse</p>
                      <p className="text-xs text-slate-500">Supports MP3, WAV, M4A, MP4 up to 100MB</p>
                    </>
                  )}
                </div>
              </div>

              {fileError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-300 text-sm font-medium">{fileError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-red-300 font-medium mb-1">Upload Failed</p>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Create Memory
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={uploading}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium rounded-xl transition-colors border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {/* Processing Info */}
            {uploading && (
              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <p className="text-blue-300 font-medium mb-1">Processing Your Audio</p>
                    <p className="text-blue-400 text-sm">
                      Neo is transcribing, analyzing speakers, and generating AI summaries. This may take a few minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}