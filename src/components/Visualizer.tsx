import React, { useMemo } from "react";
import { motion } from "motion/react";

export type VisualizerState = "idle" | "listening" | "processing" | "speaking" | "reconnecting";
export type VisualizerMode = "quantum" | "wave" | "celestial";

interface VisualizerProps {
  state: VisualizerState;
  isHearing?: boolean;
  mode?: VisualizerMode;
  onCycleMode?: () => void;
}

export default function Visualizer({ 
  state, 
  isHearing = false,
  mode = "quantum",
  onCycleMode
}: VisualizerProps) {
  // Dynamic parameters based on app state
  const config = useMemo(() => {
    switch (state) {
      case "listening":
        return {
          coreGradient: isHearing 
            ? "radial-gradient(circle at 35% 30%, #a7f3d0 0%, #10b981 45%, #064e3b 85%, #022c22 100%)"
            : "radial-gradient(circle at 35% 30%, #6ee7b7 0%, #059669 45%, #064e3b 85%, #022c22 100%)",
          glowShadow: isHearing
            ? "0 0 100px rgba(52, 211, 153, 0.7), 0 0 40px rgba(16, 185, 129, 0.9)"
            : "0 0 70px rgba(16, 185, 129, 0.45), 0 0 30px rgba(5, 150, 105, 0.6)",
          ringPrimary: "rgba(52, 211, 153, 0.8)",
          ringSecondary: "rgba(6, 182, 212, 0.7)",
          ringAccent: "rgba(16, 185, 129, 0.5)",
          speed: isHearing ? 1.4 : 2.5,
          scaleRange: isHearing ? [1, 1.15, 0.98, 1.12, 1] : [1, 1.05, 1],
        };
      case "processing":
        return {
          coreGradient: "radial-gradient(circle at 35% 30%, #c4b5fd 0%, #8b5cf6 40%, #4c1d95 80%, #1e1b4b 100%)",
          glowShadow: "0 0 100px rgba(139, 92, 246, 0.65), 0 0 40px rgba(192, 132, 252, 0.8)",
          ringPrimary: "rgba(168, 85, 247, 0.8)",
          ringSecondary: "rgba(236, 72, 153, 0.65)",
          ringAccent: "rgba(6, 182, 212, 0.6)",
          speed: 1.2,
          scaleRange: [0.94, 1.08, 0.94],
        };
      case "speaking":
        return {
          coreGradient: "radial-gradient(circle at 35% 30%, #fbcfe8 0%, #ec4899 40%, #be185d 80%, #500724 100%)",
          glowShadow: "0 0 120px rgba(236, 72, 153, 0.75), 0 0 50px rgba(244, 63, 94, 0.9)",
          ringPrimary: "rgba(244, 114, 182, 0.85)",
          ringSecondary: "rgba(251, 113, 133, 0.75)",
          ringAccent: "rgba(217, 70, 239, 0.6)",
          speed: 0.8,
          scaleRange: [1, 1.22, 0.92, 1.16, 1],
        };
      case "reconnecting":
        return {
          coreGradient: "radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 45%, #92400e 85%, #451a03 100%)",
          glowShadow: "0 0 80px rgba(245, 158, 11, 0.6), 0 0 35px rgba(217, 119, 6, 0.7)",
          ringPrimary: "rgba(251, 191, 36, 0.75)",
          ringSecondary: "rgba(245, 158, 11, 0.6)",
          ringAccent: "rgba(252, 211, 77, 0.4)",
          speed: 1.5,
          scaleRange: [0.92, 1.06, 0.92],
        };
      default: // idle
        return {
          coreGradient: "radial-gradient(circle at 35% 30%, #bae6fd 0%, #38bdf8 30%, #1e40af 75%, #0f172a 100%)",
          glowShadow: "0 0 60px rgba(56, 189, 248, 0.35), 0 0 25px rgba(59, 130, 246, 0.4)",
          ringPrimary: "rgba(56, 189, 248, 0.45)",
          ringSecondary: "rgba(129, 140, 248, 0.4)",
          ringAccent: "rgba(255, 255, 255, 0.15)",
          speed: 7.0,
          scaleRange: [1, 1.03, 1],
        };
    }
  }, [state, isHearing]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative select-none"
      onClick={onCycleMode}
    >
      {/* Ambient background volumetric glow */}
      <div 
        className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full blur-[90px] pointer-events-none transition-all duration-700 ease-out opacity-30"
        style={{
          background: state === "speaking" 
            ? "radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(139,92,246,0.2) 60%, transparent 100%)"
            : state === "listening"
            ? "radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(6,182,212,0.2) 60%, transparent 100%)"
            : state === "processing"
            ? "radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(236,72,153,0.2) 60%, transparent 100%)"
            : "radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(59,130,246,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Outer subtle concentric radar rings */}
      <div className="absolute w-[290px] h-[290px] md:w-[360px] md:h-[360px] rounded-full border border-white/[0.04] pointer-events-none" />
      <div className="absolute w-[230px] h-[230px] md:w-[290px] md:h-[290px] rounded-full border border-white/[0.06] pointer-events-none" />

      {/* Holographic 3D Preserved Chamber */}
      <div className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px] flex items-center justify-center [perspective:1200px]">
        
        {/* Orbital Ring 1 */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: config.speed * 1.6, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full rounded-full pointer-events-none"
          style={{
            border: `2px solid ${config.ringPrimary}`,
            boxShadow: `0 0 20px ${config.ringPrimary}`,
            transform: "rotateX(72deg) rotateY(20deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Orbital Bead */}
          <div 
            className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#fff]"
            style={{ transform: "translateX(-50%)" }}
          />
        </motion.div>

        {/* Orbital Ring 2 */}
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: config.speed * 2.0, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full rounded-full pointer-events-none"
          style={{
            border: `2px solid ${config.ringSecondary}`,
            boxShadow: `0 0 20px ${config.ringSecondary}`,
            transform: "rotateX(72deg) rotateY(-48deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Orbital Bead */}
          <div 
            className="absolute -bottom-1.5 left-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#fff]"
            style={{ transform: "translateX(-50%)" }}
          />
        </motion.div>

        {/* Orbital Ring 3 (Equatorial Tilt) */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: config.speed * 2.4, repeat: Infinity, ease: "linear" }}
          className="absolute w-[108%] h-[108%] rounded-full pointer-events-none"
          style={{
            border: `1.5px dashed ${config.ringAccent}`,
            transform: "rotateX(78deg) rotateY(80deg)",
            transformStyle: "preserve-3d",
          }}
        />

        {/* Outer Halo Shimmer */}
        <motion.div
          animate={{ 
            scale: state === "speaking" ? [1, 1.25, 1] : state === "listening" ? [1, 1.15, 1] : [1, 1.04, 1],
            opacity: state === "speaking" ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3]
          }}
          transition={{ duration: config.speed, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[150px] h-[150px] md:w-[180px] md:h-[180px] rounded-full pointer-events-none"
          style={{
            background: config.ringPrimary,
            filter: "blur(40px)",
          }}
        />

        {/* Central Luminous Sphere Core */}
        <motion.div
          animate={{
            scale: config.scaleRange,
          }}
          transition={{
            duration: config.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 w-[110px] h-[110px] md:w-[135px] md:h-[135px] rounded-full cursor-pointer transition-shadow duration-500 ease-out flex items-center justify-center"
          style={{
            background: config.coreGradient,
            boxShadow: config.glowShadow,
          }}
        >
          {/* Glass highlight & specular reflection */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-white/70 pointer-events-none" />
          
          {/* Internal Iris Pattern */}
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/40 flex items-center justify-center opacity-60">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 blur-[2px]" />
          </div>
        </motion.div>
      </div>

      {/* Audio Reactive Waveform Indicator below sphere */}
      {state === "speaking" && (
        <div className="absolute bottom-6 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/40 border border-pink-500/30 backdrop-blur-md">
          {[4, 12, 18, 24, 16, 20, 8, 14, 22, 10].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [4, h, 6] }}
              transition={{
                duration: 0.4 + (i % 3) * 0.15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="w-1 bg-gradient-to-t from-pink-500 to-rose-300 rounded-full"
            />
          ))}
        </div>
      )}

      {state === "listening" && (
        <div className="absolute bottom-6 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/40 border border-emerald-500/30 backdrop-blur-md">
          {[6, 14, 20, 16, 22, 12, 18, 10].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: isHearing ? [4, h * 1.3, 4] : [4, 8, 4] }}
              transition={{
                duration: 0.3 + (i % 2) * 0.1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="w-1 bg-gradient-to-t from-emerald-500 to-cyan-300 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
