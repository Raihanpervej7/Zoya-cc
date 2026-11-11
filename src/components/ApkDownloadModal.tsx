import React from "react";
import { motion } from "motion/react";
import { Download, Smartphone, X, ExternalLink, ShieldCheck, CheckCircle2, Sparkles, Github } from "lucide-react";

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl?: string;
  version?: string;
}

export default function ApkDownloadModal({
  isOpen,
  onClose,
  repoUrl = "https://github.com/raihanpervej7-cell/Zoya-cc",
  version = "v2.7.2",
}: ApkDownloadModalProps) {
  if (!isOpen) return null;

  const releaseUrl = `${repoUrl}/releases`;
  const directApkUrl = `${repoUrl}/releases/download/${version}/Zoya-AI-Companion-${version}.apk`;
  const fallbackApkUrl = `${repoUrl}/releases/latest`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 text-white font-sans"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-panel-elevated rounded-3xl overflow-hidden shadow-2xl relative border border-white/10"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#141724]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Android APK Release</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {version}
                </span>
              </div>
              <p className="text-xs text-white/50">Direct Android APK installation & GitHub Release</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Main Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">Official Android App APK</h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Install Zoya directly on your Android phone or tablet for low-latency live voice interaction and background audio.
                </p>
              </div>
              <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <Download size={16} />
                <span>Download APK from Releases</span>
              </a>

              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Github size={16} />
                <span>View Repo</span>
              </a>
            </div>
          </div>

          {/* Sideload Guide */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Quick Install Guide</h5>
            <ol className="space-y-2 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white/90 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                <span>Download the APK file from the GitHub Release page onto your device.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white/90 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                <span>Tap the downloaded <code className="text-emerald-300 font-mono">.apk</code> file in your notification bar or Downloads folder.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white/90 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                <span>If prompted, choose <strong>Allow installation from this source</strong> in Android Settings.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white/90 flex items-center justify-center shrink-0 text-[10px] font-bold">4</span>
                <span>Tap <strong>Install</strong>, launch Zoya, and grant Microphone permission!</span>
              </li>
            </ol>
          </div>

          {/* Repo metadata */}
          <div className="pt-2 text-[11px] text-white/40 flex items-center justify-between border-t border-white/5">
            <span>Repository: <strong className="text-white/60">raihanpervej7-cell/Zoya-cc</strong></span>
            <span>Automated GitHub Actions Build</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#12141F] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
