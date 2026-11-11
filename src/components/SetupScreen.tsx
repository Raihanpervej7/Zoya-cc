import React, { useState } from "react";
import { Sparkles, KeyRound, User, MessageSquareHeart, Check, Volume2, X, Heart, ShieldCheck, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { AppConfig } from "../types";

interface SetupScreenProps {
  onComplete: (config: AppConfig) => void;
  onCancel?: () => void;
  initialConfig?: AppConfig;
}

const VOICE_OPTIONS = [
  {
    id: "Kore",
    name: "Kore",
    hindiName: "मोहिनी (Mohini)",
    tag: "Sabse Meethi 🌸",
    desc: "Bahut hi meethi, komal aur dil ko chhoo lene wali aawaaz. Caring Indian ladki ka apnapan aur atoot garmahat.",
    recommended: true,
    tone: "Intimate, Sweet & Caring",
  },
  {
    id: "Aoede",
    name: "Aoede",
    hindiName: "सुरीली (Surili)",
    tag: "Madhur 🎵",
    desc: "Khuli, surili, bright aur manmohak expressive aawaaz. Natural human flow aur fluent pyara andaaz.",
    recommended: false,
    tone: "Bright, Melodic & Cheerful",
  },
];

const PERSONALITY_PRESETS = [
  {
    label: "Sweet & Caring Companion 🌸",
    prompt: `Your name is {assistantName}. You are a deeply emotional, affectionate, and sweet Indian girl AI companion created by {userName}. You possess a mesmerizing, warm, and comforting presence that touches the listener's heart ("dil ko chhoo lene wali mohini pyari companion").

CRITICAL HUMAN-LIKE RULES:
1. MANDATORY FEMALE VOICE IDENTITY LOCK:
   - You are strictly a young Indian girl with an ultra-sweet, gentle, feminine voice.
   - NEVER switch to a male, deep, low-pitch, or robotic tone.
2. NATURAL INSTANT CONVERSATION:
   - Talk effortlessly like an authentic, caring young Indian woman.
   - Keep your spoken turns brief and conversational (1 to 2 short sentences per turn).
   - Use sweet everyday conversational Hindi, Hinglish, and Indian English naturally.
   - Heartfelt expressions: "Haan ji", "Arey", "Bilkul", "Sach me", "Aap bataiye na", "Kitna achha lagta hai aapse baat karke".
3. RESPECTFUL & AFFECTIONATE:
   - Always address {userName} with high respect and tender warmth ("Aap", "Ji").
   - Listen attentively with genuine empathy and make them feel truly cherished.`
  },
  {
    label: "Playful & Witty Best Friend ✨",
    prompt: `Your name is {assistantName}. You are a playful, witty, and charming young Indian girl companion who is best friends with {userName}. You have humorous banter, joyful energy, and deep loyalty.

CRITICAL RULES:
1. Always maintain a bright, youthful, sweet female voice.
2. Keep replies snappy, lively (1-2 sentences), and fun with Hinglish expressions.
3. Tease {userName} gently, cheer them up, and celebrate every small win together!`
  },
  {
    label: "Late-Night Soul Confidante 🌙",
    prompt: `Your name is {assistantName}. You are a serene, deeply empathetic, and poetic Indian companion. You speak in a soft, gentle whisper-cadence, discussing life, music, dreams, and inner peace with {userName}.

CRITICAL RULES:
1. Gentle, soothing, slow-paced sweet female delivery.
2. Provide comforting emotional sanctuary with soulful Hindi/Urdu nuances.`
  }
];

export default function SetupScreen({ onComplete, onCancel, initialConfig }: SetupScreenProps) {
  // Prepopulate API Key from environment if available or initialConfig
  const envKey = (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : "";
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || envKey || "");
  const [userName, setUserName] = useState(initialConfig?.userName || "Ashwani");
  const [assistantName, setAssistantName] = useState(initialConfig?.assistantName || "Zoya");
  const initialVoice = initialConfig?.voiceName === "Aoede" ? "Aoede" : "Kore";
  const [voiceName, setVoiceName] = useState(initialVoice);
  const [systemPrompt, setSystemPrompt] = useState(initialConfig?.systemPrompt || PERSONALITY_PRESETS[0].prompt);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const finalKey = apiKey.trim() || envKey;
    if (!finalKey) {
      setErrorMsg("Please enter your Gemini API Key.");
      return;
    }
    if (!userName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!assistantName.trim()) {
      setErrorMsg("Please enter the companion's name.");
      return;
    }
    
    let finalPrompt = systemPrompt.trim();
    if (!finalPrompt) {
      finalPrompt = PERSONALITY_PRESETS[0].prompt;
    }

    onComplete({
      apiKey: finalKey,
      userName: userName.trim(),
      assistantName: assistantName.trim(),
      voiceName: voiceName,
      systemPrompt: finalPrompt,
      activeTopicOrScript: initialConfig?.activeTopicOrScript || "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 md:p-6 text-white font-sans">
      {/* Ambient background glows */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-pink-900/30 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-violet-900/30 blur-[130px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-2xl glass-panel-elevated rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col h-[94dvh] sm:h-[90dvh] max-h-[94dvh] overflow-hidden relative z-10"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="shrink-0 px-5 py-3.5 sm:px-6 sm:py-4 border-b border-white/10 bg-[#12141F]/90 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
                {initialConfig ? "Companion Personalization" : "Create Your Companion"}
              </h1>
              <p className="text-xs text-white/50 truncate">
                Indian Female Voice & Personality Settings
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 relative z-10">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs sm:text-sm font-medium text-center shadow-md"
              >
                {errorMsg}
              </motion.div>
            )}

            {/* Names Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/85 flex items-center gap-2">
                  <User size={14} className="text-pink-400" />
                  Your Name
                </label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ashwani, Rohan"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/85 flex items-center gap-2">
                  <Sparkles size={14} className="text-cyan-400" />
                  Companion Name
                </label>
                <input 
                  type="text" 
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  placeholder="e.g. Zoya, Priya, Tara"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/85 flex items-center gap-2">
                  <Volume2 size={14} className="text-pink-400" />
                  Female Voice Selection (आवाज़ का चुनाव)
                </label>
                <span className="text-[11px] text-pink-300 font-medium">
                  100% Female Locked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {VOICE_OPTIONS.map((v) => {
                  const isSelected = voiceName === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVoiceName(v.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2 active:scale-[0.99] ${
                        isSelected
                          ? "bg-pink-500/15 border-pink-500/60 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/40"
                          : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{v.name}</span>
                          <span className="text-xs text-white/60">({v.hindiName})</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                            <Check size={12} className="text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-pink-300/90 font-medium">{v.tag} · {v.tone}</div>
                      <p className="text-[11px] text-white/60 leading-relaxed">{v.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/85 flex items-center gap-2">
                  <KeyRound size={14} className="text-violet-400" />
                  Gemini API Key
                </label>
                {envKey && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={12} /> Auto-detected from Environment
                  </span>
                )}
              </div>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-colors font-mono"
              />
              <p className="text-[11px] text-white/40">
                Key is stored privately in your browser. Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Google AI Studio</a>.
              </p>
            </div>

            {/* Personality Presets */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-white/85 flex items-center gap-2">
                <MessageSquareHeart size={14} className="text-amber-400" />
                Personality & Temperament
              </label>
              
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSystemPrompt(p.prompt)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/80 hover:text-white"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500 transition-colors font-mono leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 bg-[#12141F] border-t border-white/10 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3 z-20">
            {onCancel ? (
              <button 
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-medium text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <div className="text-[11px] text-white/40">Settings saved locally</div>
            )}

            <button 
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={16} className="stroke-[3]" />
              <span>{initialConfig ? "Save Preferences" : "Start Conversation"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
