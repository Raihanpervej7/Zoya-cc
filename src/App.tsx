import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Send, 
  Trash2, 
  Video, 
  Settings, 
  Edit3, 
  Key, 
  Download, 
  ScrollText, 
  RefreshCw, 
  Sparkles, 
  Cpu,
  Smartphone,
  Copy,
  Check,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Volume1,
  Github,
  Radio
} from "lucide-react";
import { getZoyaResponse, getZoyaAudio, resetZoyaSession } from "./services/geminiService";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import SetupScreen from "./components/SetupScreen";
import SpecificationModal from "./components/SpecificationModal";
import TopicScriptModal from "./components/TopicScriptModal";
import VoiceSelectorModal from "./components/VoiceSelectorModal";
import ApkDownloadModal from "./components/ApkDownloadModal";
import { playPCM } from "./utils/audioUtils";
import { motion, AnimatePresence } from "motion/react";
import { AppConfig, AppState } from "./types";
import { APP_VERSION_INFO } from "./version";
import { useAppUpdate } from "./services/updateService";

interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
  timestamp?: string;
}

const QUICK_PROMPTS = [
  { label: "Aap kaise ho?", prompt: "Aap kaise ho? Aaj ka din kaisa chal raha hai?" },
  { label: "Sweet Story 🌸", prompt: "Mujhe ek pyari si meethi kahani sunaiye na." },
  { label: "Sing a Song 🎵", prompt: "Ek pyara sa geet ya shayari gungunaiye mere liye." },
  { label: "Cheer me up ✨", prompt: "Thoda thak gaya hoon, mujhe kuch achha boliye na." },
];

export default function App() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [config, setConfig] = useState<AppConfig | null>(() => {
    try {
      const saved = localStorage.getItem("zoya_app_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.voiceName !== "Aoede") {
          parsed.voiceName = "Kore";
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn("Failed to load zoya_app_config:", e);
      return null;
    }
  });

  const [appState, setAppState] = useState<AppState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("zoya_chat_history");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse chat history:", e);
    }
    return [
      {
        id: "welcome-1",
        sender: "zoya",
        text: "Namaste! Main aapki pyari companion hoon. Hum baat shuru karein?",
        timestamp: "Just now",
      }
    ];
  });
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    try {
      localStorage.setItem("zoya_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save chat history:", e);
    }
  }, [messages]);

  useEffect(() => {
    document.title = config?.assistantName 
      ? `${config.assistantName} - AI Voice Companion`
      : "Zoya - AI Voice Companion";
  }, [config?.assistantName]);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Live cloud update notification hook
  const updateInfo = useAppUpdate();

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
      liveSessionRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMicHearing, setIsMicHearing] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(() => {
    try {
      return localStorage.getItem("zoya_video_bg") || null;
    } catch {
      return null;
    }
  });

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Synchronize video background
  useEffect(() => {
    const isPlayingSession = isSessionActive && appState !== "idle";

    if (bgVideoRef.current) {
      if (isPlayingSession) {
        bgVideoRef.current.play().catch(() => {});
      } else {
        bgVideoRef.current.pause();
        bgVideoRef.current.currentTime = 0;
      }
    }
    if (mainVideoRef.current) {
      if (isPlayingSession) {
        mainVideoRef.current.play().catch(() => {});
      } else {
        mainVideoRef.current.pause();
        mainVideoRef.current.currentTime = 0;
      }
    }
  }, [isSessionActive, appState, videoSrc]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [updatingPWA, setUpdatingPWA] = useState(false);

  const handleConfigComplete = (newConfig: AppConfig) => {
    if (newConfig.voiceName !== "Aoede") {
      newConfig.voiceName = "Kore";
    }
    try {
      localStorage.setItem("zoya_app_config", JSON.stringify(newConfig));
    } catch (e) {
      console.warn("Failed to save config:", e);
    }
    setConfig(newConfig);
    setShowSettings(false);
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(newConfig);
    }
  };

  const handleSelectVoice = (newVoice: string) => {
    if (!config) return;
    const sanitizedVoice = newVoice === "Aoede" ? "Aoede" : "Kore";
    const updatedConfig: AppConfig = {
      ...config,
      voiceName: sanitizedVoice,
    };
    setConfig(updatedConfig);
    try {
      localStorage.setItem("zoya_app_config", JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn("Failed to save config voice:", e);
    }
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(updatedConfig);
    }
  };

  const handleUpdateTopic = (newTopic: string) => {
    if (!config) return;
    const updatedConfig: AppConfig = {
      ...config,
      activeTopicOrScript: newTopic,
    };
    setConfig(updatedConfig);
    try {
      localStorage.setItem("zoya_app_config", JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn("Failed to save config topic:", e);
    }
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(updatedConfig);
    }
  };

  const handleForceUpdateApp = async () => {
    setUpdatingPWA(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (e) {
      console.warn("Cache reset error:", e);
    } finally {
      window.location.reload();
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim() || !config) {
      setAppState("idle");
      return;
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev, 
      { id: Date.now().toString(), sender: "user", text: finalTranscript, timestamp: timeString }
    ]);
    
    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    // 1. Check for browser commands
    const commandResult = processCommand(finalTranscript);

    let responseText = "";

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString() + "-z", sender: "zoya", text: responseText, timestamp: timeString }
      ]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText, config);
        if (audioBase64) {
          await playPCM(audioBase64, isMuted ? 0 : volume);
        }
      }

      setAppState("idle");

      setTimeout(() => {
        if (commandResult.url) {
          window.open(commandResult.url, "_blank");
        }
      }, 1500);
    } else {
      // 2. General Chit-Chat via Gemini
      responseText = await getZoyaResponse(finalTranscript, messagesRef.current, config);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString() + "-z", sender: "zoya", text: responseText, timestamp: timeString }
      ]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText, config);
        if (audioBase64) {
          await playPCM(audioBase64, isMuted ? 0 : volume);
        }
      }
      setAppState("idle");
    }
  }, [isMuted, volume, isSessionActive, config]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      setIsMicHearing(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      resetZoyaSession();
    } else {
      if (!config) return;
      try {
        setIsSessionActive(true);
        resetZoyaSession();
        
        const session = new LiveSessionManager(config);
        session.isMuted = isMuted;
        liveSessionRef.current = session;
        
        session.onStateChange = (state) => {
          setAppState(state);
          if (state === "idle") {
            setIsSessionActive(false);
          } else {
            setIsSessionActive(true);
          }
        };
        
        session.onMessage = (sender, text) => {
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages((prev) => [
            ...prev, 
            { id: Date.now().toString() + "-" + sender, sender, text, timestamp: timeString }
          ]);
        };
        
        session.onCommand = (url) => {
          setTimeout(() => {
            window.open(url, "_blank");
          }, 1000);
        };

        session.onAudioLevel = (level) => {
          if (level > 0.012) {
            setIsMicHearing(true);
          } else if (level < 0.005) {
            setIsMicHearing(false);
          }
        };

        await session.start();
      } catch (e) {
        console.error("Failed to start session", e);
        setShowPermissionModal(true);
        setIsSessionActive(false);
        setAppState("idle");
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  if (!config) {
    return <SetupScreen onComplete={handleConfigComplete} />;
  }

  const companionName = config.assistantName || "Zoya";
  const voiceObj = config.voiceName === "Aoede" 
    ? { name: "Aoede", hindi: "सुरीली", tag: "Madhur 🎵" }
    : { name: "Kore", hindi: "मोहिनी", tag: "Sabse Meethi 🌸" };

  return (
    <div 
      className="h-[100dvh] w-screen bg-[#07090E] text-white flex flex-col font-sans relative overflow-hidden select-none m-0 p-0"
      onClick={() => {
        setMenuOpen(false);
        setShowVolumeSlider(false);
      }}
    >
      {/* Background Ambient Radiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 -right-[15%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[20%] left-1/3 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Modals */}
      {showSettings && (
        <SetupScreen 
          initialConfig={config} 
          onComplete={handleConfigComplete} 
          onCancel={() => setShowSettings(false)}
        />
      )}
      <SpecificationModal 
        isOpen={showSpecsModal} 
        onClose={() => setShowSpecsModal(false)}
        isUpdateAvailable={updateInfo.isUpdateAvailable}
        latestVersion={updateInfo.latestVersion}
      />
      {showPermissionModal && (
        <PermissionModal 
          assistantName={config?.assistantName}
          onClose={() => setShowPermissionModal(false)} 
        />
      )}
      <ApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        repoUrl="https://github.com/raihanpervej7-cell/Zoya-cc"
        version="v2.7.2"
      />

      {/* TOP BAR CONTRACT: Zone 1 (Brand) - Zone 2 (Context links) - Zone 3 (Action) */}
      <header className="w-full shrink-0 z-30 px-4 py-3.5 sm:px-8 sm:py-4 border-b border-white/[0.07] bg-[#0A0D15]/80 backdrop-blur-xl flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center shadow-md shadow-pink-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] uppercase text-white leading-none">
              {companionName}
            </h1>
            <p className="text-[10px] text-white/50 tracking-wider">AI Voice Companion</p>
          </div>
        </div>

        {/* Zone 2: Single-line context badges */}
        <div className="hidden md:flex items-center gap-2.5 text-xs text-white/70">
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer text-white/80 hover:text-white"
            title="Change voice"
          >
            <Volume2 size={13} className="text-pink-400" />
            <span>Voice: {voiceObj.name} ({voiceObj.hindi})</span>
          </button>

          <button
            onClick={() => setShowTopicModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer text-white/80 hover:text-white max-w-[200px] truncate"
            title="Active conversation focus"
          >
            <ScrollText size={13} className={config?.activeTopicOrScript?.trim() ? "text-amber-400" : "text-white/50"} />
            <span className="truncate">{config?.activeTopicOrScript?.trim() || "Free Chat"}</span>
          </button>
        </div>

        {/* Zone 3: Primary Actions (Android APK & Settings Menu) */}
        <div className="flex items-center gap-2">
          {/* Direct Android APK Download Button */}
          <button
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Download Android APK"
          >
            <Smartphone size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Android APK</span>
            <span className="text-[10px] bg-emerald-400/20 px-1.5 py-0.2 rounded font-mono">v2.7.2</span>
          </button>

          {/* Settings Menu Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors border border-white/10 text-white/80 hover:text-white cursor-pointer relative"
              title="Settings & Menu"
            >
              <Settings size={18} />
              {updateInfo.isUpdateAvailable && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
              )}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-panel-elevated rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setShowSpecsModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-cyan-300 hover:bg-white/5 transition-colors flex items-center justify-between border-b border-white/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu size={15} className="text-cyan-400" />
                      <span>Specifications</span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400/80">{APP_VERSION_INFO.version}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setShowApkModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-emerald-300 hover:bg-white/5 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <Smartphone size={15} className="text-emerald-400" />
                    <span>Android APK Release</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setShowSettings(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-white/90 hover:bg-white/5 transition-colors flex items-center gap-2.5 cursor-pointer"
                  >
                    <Edit3 size={15} className="text-pink-400" />
                    <span>Personalize Personality</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setShowVoiceModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-white/90 hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer border-t border-white/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Volume2 size={15} className="text-amber-400" />
                      <span>Change Voice</span>
                    </div>
                    <span className="text-[10px] text-pink-300">{voiceObj.name}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setShowTopicModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-white/90 hover:bg-white/5 transition-colors flex items-center gap-2.5 cursor-pointer border-t border-white/5"
                  >
                    <ScrollText size={15} className="text-violet-400" />
                    <span>Topic & Script Focus</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm("Clear all conversation history?")) {
                        setMessages([]);
                        resetZoyaSession();
                        localStorage.removeItem("zoya_chat_history");
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2.5 cursor-pointer border-t border-white/5"
                  >
                    <Trash2 size={15} />
                    <span>Clear Chat Memory</span>
                  </button>

                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      handleForceUpdateApp();
                    }}
                    className="w-full text-left px-4 py-2.5 text-white/60 hover:bg-white/5 transition-colors flex items-center gap-2.5 cursor-pointer border-t border-white/5"
                  >
                    <RefreshCw size={15} className={updatingPWA ? "animate-spin" : ""} />
                    <span>Force Refresh Cache</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* RESPONSIVE MASTER LAYOUT: Left (Voice Stage) + Right (Studio Hub & Transcript) */}
      <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: Visualizer Stage & Primary Voice Interaction */}
        <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden">
          
          {/* Status Pill Indicator */}
          <div className="w-full flex justify-center z-20 pointer-events-none min-h-[40px]">
            <AnimatePresence mode="wait">
              {appState === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="flex items-center gap-2 text-violet-300 text-xs sm:text-sm font-medium bg-[#141724]/90 px-4 py-1.5 rounded-full backdrop-blur-md border border-violet-500/30 shadow-lg shadow-violet-500/10"
                >
                  <Loader2 size={15} className="animate-spin text-violet-400" />
                  <span>{companionName} is thinking...</span>
                </motion.div>
              )}
              {appState === "listening" && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-medium bg-[#141724]/90 px-4 py-1.5 rounded-full backdrop-blur-md border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                >
                  <div className={`w-2 h-2 rounded-full ${isMicHearing ? "bg-emerald-400 shadow-[0_0_10px_#34d399] scale-125" : "bg-emerald-400 animate-pulse"}`} />
                  <span>{isMicHearing ? "Hearing your voice..." : "Listening to you..."}</span>
                </motion.div>
              )}
              {appState === "speaking" && (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="flex items-center gap-2 text-pink-300 text-xs sm:text-sm font-medium bg-[#141724]/90 px-4 py-1.5 rounded-full backdrop-blur-md border border-pink-500/30 shadow-lg shadow-pink-500/10"
                >
                  <Volume2 size={15} className="animate-pulse text-pink-400" />
                  <span>{companionName} is speaking ({voiceObj.name})...</span>
                </motion.div>
              )}
              {appState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-white/50 text-xs font-normal"
                >
                  <Radio size={12} className="text-cyan-400" />
                  <span>Tap the microphone below to talk</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Central Luminous Sphere Container */}
          <div className="flex-1 w-full max-w-md flex items-center justify-center relative my-2">
            <div 
              onClick={toggleListening}
              className="w-full aspect-square max-h-[380px] rounded-[36px] glass-panel flex items-center justify-center relative cursor-pointer group transition-all duration-300 hover:border-white/20 active:scale-[0.99]"
              title={isSessionActive ? "Tap to end session" : "Tap to speak with Zoya"}
            >
              <Visualizer state={appState} isHearing={isMicHearing} />
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="w-full max-w-md flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleTextCommand(qp.prompt)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Text Input Row (Expandable) */}
          <AnimatePresence>
            {showTextInput && (
              <motion.form 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                onSubmit={handleTextSubmit}
                className="w-full max-w-md flex items-center gap-2 bg-[#121420] border border-white/15 rounded-2xl p-1.5 pl-4 shadow-2xl mb-3"
              >
                <input 
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Type a message to ${companionName}...`}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-xs sm:text-sm"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={!textInput.trim()}
                  className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 transition-colors text-white cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Primary Voice Interaction Bar */}
          <div className="w-full max-w-md flex items-center gap-3 pt-2">
            {/* Keyboard toggle */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                showTextInput ? "bg-white/15 border-white/30" : "bg-white/[0.05] border-white/10 hover:bg-white/[0.1]"
              }`}
              title="Type text"
            >
              <Keyboard size={20} className="text-white/80" />
            </button>

            {/* Main Microphone Button */}
            <button
              onClick={toggleListening}
              className={`
                flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.98]
                ${
                  isSessionActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30 shadow-rose-500/10"
                    : "bg-gradient-to-r from-pink-600 via-rose-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white shadow-pink-500/20"
                }
              `}
            >
              {isSessionActive ? (
                <>
                  <MicOff size={18} />
                  <span>End Voice Session</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>Start Live Voice</span>
                </>
              )}
            </button>

            {/* Volume control */}
            <div className="relative">
              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-3 right-0 px-4 py-3 bg-[#181B28] border border-white/15 rounded-2xl shadow-2xl z-50 flex items-center min-w-[130px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        setIsMuted(val === 0);
                      }}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-pink-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVolumeSlider(!showVolumeSlider);
                }}
                className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer"
                title="Volume"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} className="text-white/40" />
                ) : (
                  <Volume2 size={20} className="text-white/80" />
                )}
              </button>
            </div>

            {/* Mobile Chat Drawer Toggle */}
            <button
              onClick={() => setShowMobileChat(!showMobileChat)}
              className="lg:hidden p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer text-white/80"
              title="Toggle Transcript"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Live Conversation & Companion Hub */}
        <div className={`
          lg:w-[420px] xl:w-[460px] h-full border-l border-white/[0.07] bg-[#0A0D15]/60 backdrop-blur-xl flex flex-col z-20 shrink-0
          ${showMobileChat ? "fixed inset-0 z-50 bg-[#0A0D15]/95 flex" : "hidden lg:flex"}
        `}>
          {/* Studio Panel Header */}
          <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-pink-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Live Conversation Stream</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Clear conversation transcript?")) {
                    setMessages([]);
                    localStorage.removeItem("zoya_chat_history");
                  }
                }}
                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 transition-colors"
                title="Clear transcript"
              >
                <Trash2 size={14} />
              </button>

              {/* Mobile Close Button */}
              {showMobileChat && (
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white"
                >
                  <ChevronDown size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Android Release Banner Card in Sidebar */}
          <div className="p-3 mx-4 mt-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Smartphone size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-emerald-300 truncate">Android APK Ready</div>
                <div className="text-[10px] text-white/50 truncate">GitHub: raihanpervej7-cell/Zoya-cc</div>
              </div>
            </div>
            <button
              onClick={() => setShowApkModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold shrink-0 cursor-pointer"
            >
              Get APK
            </button>
          </div>

          {/* Transcript Message Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                <Sparkles size={24} className="mb-2 text-pink-400/60" />
                <p className="text-xs">No messages yet. Speak or type to start chatting with {companionName}.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isZoya = msg.sender === "zoya";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isZoya ? "items-start" : "items-end"} group`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-white/40">
                      <span className="font-semibold text-white/70">
                        {isZoya ? companionName : config.userName || "You"}
                      </span>
                      {msg.timestamp && <span>· {msg.timestamp}</span>}
                    </div>

                    <div
                      className={`
                        relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-all
                        ${
                          isZoya
                            ? "bg-[#181B28] text-white/90 border border-white/10 rounded-tl-sm shadow-md"
                            : "bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-sm shadow-md shadow-pink-600/10"
                        }
                      `}
                    >
                      {msg.text}

                      {/* Copy hover action */}
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="absolute right-2 -bottom-2.5 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/70 text-white/80 hover:text-white transition-opacity"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sidebar Quick Reply Input */}
          <div className="p-3 border-t border-white/[0.07] bg-[#0A0D15]/80">
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Message ${companionName}...`}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-pink-500/60"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Voice Selection Modal */}
      {showVoiceModal && (
        <VoiceSelectorModal
          assistantName={config?.assistantName}
          currentVoice={config?.voiceName || "Kore"}
          onSelectVoice={handleSelectVoice}
          onClose={() => setShowVoiceModal(false)}
        />
      )}

      {/* Topic Selection Modal */}
      {showTopicModal && (
        <TopicScriptModal
          assistantName={config?.assistantName}
          currentTopic={config?.activeTopicOrScript || ""}
          onSave={handleUpdateTopic}
          onClose={() => setShowTopicModal(false)}
        />
      )}
    </div>
  );
}
