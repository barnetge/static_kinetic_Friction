import React, { useState, useEffect } from 'react';
import { Surface, PushObject, VectorDisplayOptions, SimState } from '../types/physics';
import { ZoomIn, ZoomOut, Play, Pause, Eye, EyeOff, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface SimulationCanvasProps {
  surface: Surface;
  object: PushObject;
  simState: SimState;
  vectorOptions: VectorDisplayOptions;
  onResetPosition: () => void;
  pushForce: number;
  onChangePushForce: (force: number) => void;
  surfaceFriction: number;
  onChangeSurfaceFriction: (friction: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  showObject: boolean;
  onToggleShowObject: () => void;
  showActionReaction: boolean;
  onToggleActionReaction: () => void;
  availableObjects: PushObject[];
  onSelectObject: (obj: PushObject) => void;
  onResetAll: () => void;
  trackLength: number;
  onChangeTrackLength: (dist: number) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  surface,
  object,
  simState,
  vectorOptions,
  onResetPosition,
  pushForce,
  onChangePushForce,
  surfaceFriction,
  onChangeSurfaceFriction,
  isPaused,
  onTogglePause,
  showObject,
  onToggleShowObject,
  showActionReaction,
  onToggleActionReaction,
  availableObjects,
  onSelectObject,
  onResetAll,
  trackLength,
  onChangeTrackLength,
}) => {
  // Microscopic view defaults to OFF as requested
  const [showMicroscope, setShowMicroscope] = useState<boolean>(false);
  const [characterStyle, setCharacterStyle] = useState<'leo' | 'maya' | 'bot'>('leo');
  const [dustPuffs, setDustPuffs] = useState<{ id: number; x: number; y: number }[]>([]);

  // Periodically spawn dust puffs when moving fast
  useEffect(() => {
    if (simState.isMoving && simState.velocity > 0.3) {
      const interval = setInterval(() => {
        setDustPuffs((prev) => [
          ...prev.slice(-4),
          {
            id: Date.now() + Math.random(),
            x: -20 + Math.random() * 10,
            y: Math.random() * 8,
          },
        ]);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [simState.isMoving, simState.velocity]);

  // Track layout & box position
  const trackStartX = 190;
  const trackEndX = 760;
  const trackWidth = trackEndX - trackStartX;
  const boxX = trackStartX + (simState.position / Math.max(1, trackLength)) * trackWidth;
  const groundY = 275;

  // Box dimensions
  const boxW = object.width;
  const boxH = object.height;
  const boxY = groundY - boxH;

  // Shaking effect when close to breakaway
  const isStrainingHard =
    !simState.isMoving &&
    simState.pushForce > 0 &&
    simState.pushForce >= simState.maxStaticFriction * 0.82;
  const boxShakeX = isStrainingHard ? (Math.random() - 0.5) * 3 : 0;

  // Center coordinate of box
  const boxCenterX = boxX + boxW / 2 + boxShakeX;

  // Compact force magnitude scaling for arrows (pixels per Newton)
  const arrowScale = 0.26;
  const minArrowLen = 14;
  const pushArrowLen = Math.max(minArrowLen, Math.min(160, simState.pushForce * arrowScale));
  const frictionArrowLen = Math.max(minArrowLen, Math.min(160, simState.currentFriction * arrowScale));
  const netArrowLen = Math.max(minArrowLen, Math.min(160, Math.abs(simState.netForce) * arrowScale));
  const vertArrowLen = Math.max(minArrowLen, Math.min(95, simState.gravityForce * 0.14));

  // Pusher anchor: Hands meet the left edge of the box at (boxX + boxShakeX)
  const contactX = boxX + boxShakeX;
  const contactY = groundY - boxH * 0.45;

  // Animation cycle for walking/pushing
  const stridePhase = (simState.position / Math.max(1, trackLength)) * 120 + (simState.isMoving ? Date.now() * 0.008 : 0);
  const pushRatio = Math.min(1, simState.pushForce / Math.max(1, simState.maxStaticFriction));

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-4 border-emerald-300 shadow-xl bg-gradient-to-b from-sky-100 via-sky-50 to-white flex flex-col">
      {/* Top Banner & In-Window Controls */}
      <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Play / Start Button and State Indicator */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              if (isPaused && pushForce === 0) {
                onChangePushForce(75);
              }
              onTogglePause();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 ${
              isPaused
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ring-2 ring-emerald-300'
                : 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START SIMULATION</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            )}
          </button>

          {/* Track Distance Drop Down Menu (100m to 5000m) */}
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-2xl shadow-xs">
            <span className="text-xs font-black text-indigo-950 flex items-center gap-1">
              <span>📏</span>
              <span className="hidden sm:inline">Track:</span>
            </span>
            <select
              value={trackLength}
              onChange={(e) => {
                sound.playClick();
                onChangeTrackLength(Number(e.target.value));
              }}
              className="bg-white text-xs font-black text-indigo-900 py-1 px-2 rounded-xl border border-indigo-300 shadow-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer"
              title="Select track distance (100m up to 5000m)"
            >
              <option value={100}>100 m (Default)</option>
              <option value={250}>250 m</option>
              <option value={500}>500 m</option>
              <option value={1000}>1,000 m (1 km)</option>
              <option value={2000}>2,000 m (2 km)</option>
              <option value={3000}>3,000 m (3 km)</option>
              <option value={5000}>5,000 m (5 km)</option>
            </select>
          </div>

          {/* Current Motion Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span>{simState.isMoving ? '🚀' : pushForce > 0 ? '💪' : '⏸️'}</span>
            <span>
              {simState.isMoving ? (
                <strong className="text-emerald-700">Sliding! (Kinetic Friction)</strong>
              ) : pushForce > 0 ? (
                <strong className="text-amber-700">Locked by Static Friction!</strong>
              ) : (
                'At Rest • Ready to Push'
              )}
            </span>
          </div>
        </div>

        {/* Action Toggles: In-Window Object Picker, Object Toggle, Character Choice, Microscope Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Object Selector directly inside the Simulation Window */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-black text-slate-500 pl-1.5 hidden xl:inline">Object:</span>
            {availableObjects.map((obj) => {
              const isSelected = object.id === obj.id;
              return (
                <button
                  key={obj.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectObject(obj);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                  title={`${obj.name} (${obj.mass} kg)`}
                >
                  <span className="text-sm">{obj.icon}</span>
                  <span className="font-extrabold">{obj.mass}kg</span>
                </button>
              );
            })}
          </div>

          {/* Object Visibility Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleShowObject();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-2xl border transition active:scale-95 ${
              showObject
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-200 text-slate-600 border-slate-300'
            }`}
            title="Toggle object visibility to inspect forces"
          >
            {showObject ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Object: {showObject ? 'Visible' : 'Hidden'}</span>
          </button>

          {/* Action-Reaction Pairs Toggle Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleActionReaction();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-2xl border transition active:scale-95 ${
              showActionReaction
                ? 'bg-orange-500 text-white border-orange-600 shadow-xs ring-2 ring-orange-300'
                : 'bg-white text-orange-950 border-orange-200 hover:bg-orange-50'
            }`}
            title="Toggle Newton's 3rd Law Action-Reaction partner forces"
          >
            <span>⚖️</span>
            <span>Action-Reaction: {showActionReaction ? 'ON' : 'OFF'}</span>
          </button>

          {/* Avatar choice */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setCharacterStyle('leo')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                characterStyle === 'leo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              👦 Leo
            </button>
            <button
              onClick={() => setCharacterStyle('maya')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                characterStyle === 'maya'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              👧 Maya
            </button>
            <button
              onClick={() => setCharacterStyle('bot')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                characterStyle === 'bot'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              🤖 Sparky
            </button>
          </div>

          {/* Microscopic Zoom Toggle Button (Defaults to OFF) */}
          <button
            onClick={() => {
              sound.playClick();
              setShowMicroscope(!showMicroscope);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-2xl shadow-sm border transition active:scale-95 ${
              showMicroscope
                ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300'
                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
            }`}
          >
            {showMicroscope ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span>Microscopic View: {showMicroscope ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main SVG Scene */}
      <svg
        viewBox="0 0 900 370"
        className="w-full h-auto select-none"
        style={{ minHeight: '320px' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="70%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>

          {/* Ice Surface Texture */}
          <pattern id="icePattern" width="60" height="40" patternUnits="userSpaceOnUse">
            <rect width="60" height="40" fill="#bae6fd" opacity="0.6" />
            <path
              d="M 0 20 L 30 10 L 60 25 M 15 35 L 45 25"
              stroke="#7dd3fc"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <circle cx="20" cy="8" r="1.5" fill="#ffffff" />
            <circle cx="48" cy="30" r="1.2" fill="#ffffff" />
          </pattern>

          {/* Wood Floor Texture */}
          <pattern id="woodPattern" width="90" height="35" patternUnits="userSpaceOnUse">
            <rect width="90" height="35" fill="#fef08a" />
            <line x1="0" y1="0" x2="90" y2="0" stroke="#ca8a04" strokeWidth="2" opacity="0.4" />
            <line x1="0" y1="18" x2="90" y2="18" stroke="#ca8a04" strokeWidth="1.5" opacity="0.3" />
            <line x1="0" y1="35" x2="90" y2="35" stroke="#ca8a04" strokeWidth="2" opacity="0.4" />
            <line x1="45" y1="0" x2="45" y2="18" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
            <line x1="15" y1="18" x2="15" y2="35" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
            <line x1="75" y1="18" x2="75" y2="35" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
          </pattern>

          {/* Carpet Texture */}
          <pattern id="carpetPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#c7d2fe" />
            <circle cx="5" cy="5" r="2.5" fill="#818cf8" opacity="0.6" />
            <circle cx="15" cy="15" r="2.5" fill="#818cf8" opacity="0.6" />
            <circle cx="15" cy="5" r="1.5" fill="#6366f1" opacity="0.4" />
            <circle cx="5" cy="15" r="1.5" fill="#6366f1" opacity="0.4" />
          </pattern>

          {/* Sandpaper Texture */}
          <pattern id="sandpaperPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="#fed7aa" />
            <rect x="3" y="6" width="3" height="3" fill="#ea580c" opacity="0.5" />
            <rect x="18" y="12" width="4" height="3" fill="#c2410c" opacity="0.6" />
            <rect x="10" y="22" width="3" height="4" fill="#9a3412" opacity="0.5" />
            <rect x="25" y="4" width="2" height="2" fill="#7c2d12" opacity="0.6" />
          </pattern>

          {/* Rubber Texture */}
          <pattern id="rubberPattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#fbcfe8" />
            <path d="M 0 12 L 12 0 L 24 12 L 12 24 Z" fill="#f472b6" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="#db2777" opacity="0.5" />
          </pattern>

          {/* Sleek, Compact Arrowheads (Scaled down so they do NOT obstruct text) */}
          <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <polygon points="0 1, 4.5 3, 0 5" fill="#2563eb" />
          </marker>
          <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <polygon points="0 1, 4.5 3, 0 5" fill="#dc2626" />
          </marker>
          <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <polygon points="0 1, 4.5 3, 0 5" fill="#16a34a" />
          </marker>
          <marker id="arrowPurple" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <polygon points="0 1, 4.5 3, 0 5" fill="#9333ea" />
          </marker>
          <marker id="arrowYellow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <polygon points="0 1, 4.5 3, 0 5" fill="#ca8a04" />
          </marker>
          <marker id="arrowOrange" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <polygon points="0 1, 4.5 3, 0 5" fill="#ea580c" />
          </marker>

          {/* Drop Shadows */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Classroom Background Wall & Baseboard */}
        <rect x="0" y="0" width="900" height={groundY} fill="url(#skyGrad)" />
        <line x1="0" y1="210" x2="900" y2="210" stroke="#cbd5e1" strokeWidth="3" />
        <rect x="0" y="210" width="900" height={groundY - 210} fill="#f8fafc" opacity="0.7" />

        {/* Live Distance & Track Progress HUD on Classroom Wall */}
        <g transform="translate(450, 26)">
          <rect x="-140" y="-14" width="280" height="28" rx="14" fill="#ffffff" fillOpacity="0.92" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="0" y="5" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">
            🏃 Distance: <tspan fill="#2563eb" fontWeight="900">{simState.position.toFixed(1)} m</tspan> / <tspan fill="#475569">{trackLength >= 1000 ? `${(trackLength / 1000).toFixed(trackLength % 1000 === 0 ? 0 : 1)} km` : `${trackLength} m`}</tspan>
            {simState.isMoving && <tspan fill="#16a34a" fontWeight="900"> ({simState.velocity.toFixed(1)} m/s)</tspan>}
          </text>
        </g>

        {/* Finish Line Celebration Banner */}
        {simState.position >= trackLength && (
          <g transform="translate(450, 68)">
            <rect x="-120" y="-12" width="240" height="24" rx="8" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="black">
              🏁 FINISH LINE REACHED! ({trackLength} m)
            </text>
          </g>
        )}

        {/* Floor Surface Strip */}
        <g>
          <rect
            x="0"
            y={groundY}
            width="900"
            height="95"
            fill={
              surface.textureType === 'ice'
                ? 'url(#icePattern)'
                : surface.textureType === 'wood'
                ? 'url(#woodPattern)'
                : surface.textureType === 'carpet'
                ? 'url(#carpetPattern)'
                : surface.textureType === 'sandpaper'
                ? 'url(#sandpaperPattern)'
                : 'url(#rubberPattern)'
            }
          />
          <line x1="0" y1={groundY} x2="900" y2={groundY} stroke={surface.borderColor} strokeWidth="4" />

          {/* Dynamic Track Distance Meter Rulers along floor (100m to 5000m) */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((frac, idx) => {
            const meter = Math.round(frac * trackLength);
            const markX = trackStartX + frac * trackWidth;
            const label = meter >= 1000 ? `${(meter / 1000).toFixed(meter % 1000 === 0 ? 0 : 1)} km` : `${meter} m`;
            return (
              <g key={idx} transform={`translate(${markX}, ${groundY + 12})`}>
                <line x1="0" y1="0" x2="0" y2="16" stroke="#475569" strokeWidth="2" opacity="0.6" />
                <rect x="-18" y="18" width="36" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="0" y="30" textAnchor="middle" fill="#334155" fontSize="8.5" fontWeight="bold">
                  {label}
                </text>
              </g>
            );
          })}

          {/* Finish Line Checkered Banner at Track End */}
          <g transform={`translate(${trackEndX + 14}, ${groundY - 58})`}>
            {/* Flagpole */}
            <line x1="0" y1="0" x2="0" y2="58" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="3.5" fill="#ca8a04" />
            {/* Checkered Flag */}
            <g transform="translate(1, 2)">
              <rect x="0" y="0" width="24" height="16" fill="#0f172a" rx="1" />
              <rect x="0" y="0" width="6" height="8" fill="#ffffff" />
              <rect x="12" y="0" width="6" height="8" fill="#ffffff" />
              <rect x="6" y="8" width="6" height="8" fill="#ffffff" />
              <rect x="18" y="8" width="6" height="8" fill="#ffffff" />
            </g>
            {/* Finish label badge */}
            <g transform="translate(13, 24)">
              <rect x="-18" y="-7" width="36" height="14" rx="3" fill="#0f172a" />
              <text x="0" y="3" textAnchor="middle" fill="#facc15" fontSize="7" fontWeight="black">
                FINISH
              </text>
            </g>
          </g>
        </g>

        {/* Dust Puffs when sliding */}
        {dustPuffs.map((puff) => (
          <circle
            key={puff.id}
            cx={boxX + puff.x}
            cy={groundY - 5 + puff.y}
            r="6"
            fill="#e2e8f0"
            opacity="0.75"
            className="animate-dust"
          />
        ))}

        {/* Object Contact Shadow */}
        {showObject && (
          <ellipse
            cx={boxX + boxW / 2 + boxShakeX}
            cy={groundY + 3}
            rx={boxW * 0.52}
            ry="6"
            fill="#334155"
            opacity="0.25"
          />
        )}

        {/* Pusher Character Contact Shadow */}
        <ellipse
          cx={contactX - 35}
          cy={groundY + 2}
          rx="26"
          ry="5"
          fill="#334155"
          opacity="0.2"
        />

        {/* THE PUSHING CHARACTER */}
        <g transform={`translate(${contactX}, ${groundY})`}>
          {characterStyle === 'leo' && (
            <LeoCharacter
              simState={simState}
              isStrainingHard={isStrainingHard}
              pushRatio={pushRatio}
              stridePhase={stridePhase}
              boxH={boxH}
            />
          )}
          {characterStyle === 'maya' && (
            <MayaCharacter
              simState={simState}
              isStrainingHard={isStrainingHard}
              pushRatio={pushRatio}
              stridePhase={stridePhase}
              boxH={boxH}
            />
          )}
          {characterStyle === 'bot' && (
            <BotCharacter
              simState={simState}
              isStrainingHard={isStrainingHard}
              pushRatio={pushRatio}
              stridePhase={stridePhase}
              boxH={boxH}
            />
          )}
        </g>

        {/* THE OBJECT BEING PUSHED (Supports user toggle on/off) */}
        {showObject ? (
          <g transform={`translate(${boxX + boxShakeX}, ${boxY})`} filter="url(#softShadow)">
            {object.id === 'gift' && <GiftBoxSVG width={boxW} height={boxH} />}
            {object.id === 'crate' && <CrateSVG width={boxW} height={boxH} />}
            {object.id === 'chest' && <TreasureChestSVG width={boxW} height={boxH} />}
            {object.id === 'safe' && <BankSafeSVG width={boxW} height={boxH} />}
            {object.id === 'piano' && <PianoSVG width={boxW} height={boxH} isMoving={simState.isMoving} />}

            {/* Mass Badge tag on the box */}
            <g transform={`translate(${boxW / 2}, ${boxH - 18})`}>
              <rect x="-26" y="-10" width="52" height="20" rx="6" fill="#0f172a" opacity="0.85" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                {object.mass} kg
              </text>
            </g>
          </g>
        ) : (
          /* When Object is Toggled OFF: Subtle dashed ghost outline */
          <g transform={`translate(${boxX + boxShakeX}, ${boxY})`}>
            <rect
              width={boxW}
              height={boxH}
              rx="8"
              fill="#f8fafc"
              fillOpacity="0.4"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <g transform={`translate(${boxW / 2}, ${boxH / 2})`}>
              <rect x="-35" y="-11" width="70" height="22" rx="6" fill="#334155" opacity="0.85" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">
                {object.mass} kg (Hidden)
              </text>
            </g>
          </g>
        )}

        {/* 1. HORIZONTAL FORCES (Push Force and Net Force) - Center of Box */}
        {(vectorOptions.showAppliedForce || vectorOptions.showNetForce) && (
          <g transform={`translate(${boxCenterX}, ${boxY + boxH * 0.45})`}>
            {/* Center of Mass Marker */}
            <circle cx="0" cy="0" r="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />

            {/* Applied Push Force Arrow (Blue -> Right) */}
            {vectorOptions.showAppliedForce && simState.pushForce > 0 && (
              <g>
                <line
                  x1="4"
                  y1="0"
                  x2={pushArrowLen}
                  y2="0"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowBlue)"
                />
                <g transform={`translate(${pushArrowLen + 10}, -10)`}>
                  <rect
                    x="-6"
                    y="-10"
                    width={vectorOptions.showValues ? '95' : '65'}
                    height="20"
                    rx="5"
                    fill="#1d4ed8"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <text
                    x={vectorOptions.showValues ? '41' : '26'}
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {vectorOptions.showValues ? `Push: ${simState.pushForce.toFixed(0)} N` : 'Push Force'}
                  </text>
                </g>
              </g>
            )}

            {/* Net Force Arrow (Lime Green -> Right or Left) */}
            {vectorOptions.showNetForce && (
              <g transform="translate(0, -25)">
                {Math.abs(simState.netForce) > 0.5 ? (
                  <g>
                    <line
                      x1="0"
                      y1="0"
                      x2={simState.netForce > 0 ? netArrowLen : -netArrowLen}
                      y2="0"
                      stroke="#16a34a"
                      strokeWidth="4"
                      strokeLinecap="round"
                      markerEnd="url(#arrowGreen)"
                    />
                    <g transform={`translate(${simState.netForce > 0 ? netArrowLen + 10 : -netArrowLen - 10}, 0)`}>
                      <rect
                        x={simState.netForce > 0 ? '-6' : '-95'}
                        y="-10"
                        width={vectorOptions.showValues ? '100' : '72'}
                        height="20"
                        rx="5"
                        fill="#15803d"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                      <text
                        x={simState.netForce > 0 ? (vectorOptions.showValues ? '44' : '30') : (vectorOptions.showValues ? '-44' : '-58')}
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {vectorOptions.showValues ? `Net: ${simState.netForce.toFixed(0)} N` : 'Net Force'}
                      </text>
                    </g>
                  </g>
                ) : (
                  <g>
                    <circle cx="0" cy="0" r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="1.5" />
                    <g transform="translate(0, -15)">
                      <rect x="-48" y="-9" width="96" height="18" rx="4" fill="#15803d" stroke="#ffffff" strokeWidth="1" />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="bold">
                        Net: 0 N (Balanced!)
                      </text>
                    </g>
                  </g>
                )}
              </g>
            )}
          </g>
        )}

        {/* 2. FRICTION VECTOR AT THE INTERFACE (y = groundY) */}
        {vectorOptions.showFriction && simState.currentFriction > 0 && (
          <g transform={`translate(${boxX + boxW * 0.4 + boxShakeX}, ${groundY})`}>
            <circle cx="0" cy="0" r="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
            <line
              x1="-3"
              y1="0"
              x2={-frictionArrowLen}
              y2="0"
              stroke="#dc2626"
              strokeWidth="4"
              strokeLinecap="round"
              markerEnd="url(#arrowRed)"
            />
            <g transform={`translate(${-frictionArrowLen - 12}, -12)`}>
              <rect
                x={vectorOptions.showValues ? '-140' : '-105'}
                y="-10"
                width={vectorOptions.showValues ? '140' : '105'}
                height="20"
                rx="5"
                fill="#b91c1c"
                stroke="#ffffff"
                strokeWidth="1.2"
              />
              <text
                x={vectorOptions.showValues ? '-70' : '-52'}
                y="3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontWeight="bold"
              >
                {vectorOptions.showValues
                  ? `Friction (μ = ${surfaceFriction.toFixed(2)}): ${simState.currentFriction.toFixed(0)} N`
                  : `Friction (μ = ${surfaceFriction.toFixed(2)})`}
              </text>
            </g>
          </g>
        )}

        {/* 3. VERTICAL FORCES:
               - NORMAL FORCE starts at the TOP of the object (y = boxY) pointing UP
               - GRAVITATIONAL FORCE starts at the BOTTOM of the object (y = groundY) pointing DOWN
        */}
        {vectorOptions.showVerticalForces && (
          <g>
            {/* NORMAL FORCE: Starting at the TOP of the object (boxY) pointing UP */}
            <g transform={`translate(${boxCenterX}, ${boxY})`}>
              {/* Anchor dot on top surface */}
              <circle cx="0" cy="0" r="4" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.5" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={-vertArrowLen}
                stroke="#ca8a04"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrowYellow)"
              />
              <g transform={`translate(0, ${-vertArrowLen - 14})`}>
                <rect x="-65" y="-10" width="130" height="20" rx="5" fill="#ca8a04" stroke="#ffffff" strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  {vectorOptions.showValues ? `Normal: ${simState.normalForce.toFixed(0)} N` : 'Normal Force (Floor)'}
                </text>
              </g>
            </g>

            {/* GRAVITATIONAL FORCE: Starting at the BOTTOM of the object (groundY) pointing DOWN */}
            <g transform={`translate(${boxCenterX}, ${groundY})`}>
              {/* Anchor dot on bottom surface */}
              <circle cx="0" cy="0" r="4" fill="#7e22ce" stroke="#ffffff" strokeWidth="1.5" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={vertArrowLen}
                stroke="#7e22ce"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrowPurple)"
              />
              <g transform={`translate(0, ${vertArrowLen + 14})`}>
                <rect x="-65" y="-10" width="130" height="20" rx="5" fill="#7e22ce" stroke="#ffffff" strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  {vectorOptions.showValues ? `Gravity (Weight): ${simState.gravityForce.toFixed(0)} N` : 'Gravity (Weight)'}
                </text>
              </g>
            </g>
          </g>
        )}

        {/* 4. ACTION-REACTION PAIRS */}
        {vectorOptions.showActionReaction && (
          <g>
            {simState.pushForce > 0 && (
              <g transform={`translate(${contactX}, ${contactY})`}>
                <line
                  x1="0"
                  y1="0"
                  x2={-pushArrowLen}
                  y2="0"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  markerEnd="url(#arrowOrange)"
                />
                <g transform={`translate(${-pushArrowLen - 10}, 14)`}>
                  <rect x="-70" y="-9" width="140" height="18" rx="4" fill="#ea580c" stroke="#ffffff" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                    {vectorOptions.showValues
                      ? `Reaction: Box pushes back (${simState.pushForce.toFixed(0)} N)`
                      : 'Reaction: Box on Hands'}
                  </text>
                </g>
              </g>
            )}

            {simState.currentFriction > 0 && (
              <g transform={`translate(${boxCenterX}, ${groundY + 8})`}>
                <line
                  x1="0"
                  y1="0"
                  x2={frictionArrowLen}
                  y2="0"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  markerEnd="url(#arrowOrange)"
                />
                <g transform={`translate(${frictionArrowLen + 10}, 10)`}>
                  <rect x="-5" y="-9" width="140" height="18" rx="4" fill="#c2410c" stroke="#ffffff" strokeWidth="1" />
                  <text x="65" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                    {vectorOptions.showValues
                      ? `Reaction: Box on floor (${simState.currentFriction.toFixed(0)} N)`
                      : 'Reaction: Box on Floor'}
                  </text>
                </g>
              </g>
            )}
          </g>
        )}

        {/* 5. MICROSCOPIC SURFACE CONTACT LENS (Visible only when toggled ON) */}
        {showMicroscope && (
          <g transform="translate(685, 175)" filter="url(#softShadow)">
            <circle cx="80" cy="80" r="76" fill="#ffffff" stroke="#7c3aed" strokeWidth="4" />
            <clipPath id="lensClip">
              <circle cx="80" cy="80" r="72" />
            </clipPath>

            <g clipPath="url(#lensClip)">
              <rect x="0" y="0" width="160" height="160" fill="#1e1b4b" />
              <g transform={`translate(${simState.isMoving ? (Date.now() % 40) * (simState.velocity * 0.4) : 0}, 0)`}>
                <path
                  d="M -50 0 L 220 0 L 220 70 L 190 70 L 180 82 L 170 70 L 150 70 L 140 84 L 130 70 L 110 70 L 100 83 L 90 70 L 70 70 L 60 85 L 50 70 L 30 70 L 20 83 L 10 70 L -10 70 L -20 84 L -30 70 L -50 70 Z"
                  fill="#f59e0b"
                  opacity="0.9"
                />
                <text x="80" y="35" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  BOX SURFACE (Zoom)
                </text>
              </g>

              <path
                d="M -50 160 L 220 160 L 220 90 L 195 90 L 180 77 L 165 90 L 145 90 L 140 76 L 125 90 L 105 90 L 100 77 L 85 90 L 65 90 L 60 75 L 45 90 L 25 90 L 20 77 L 5 90 L -15 90 L -20 76 L -35 90 L -50 90 Z"
                fill={
                  surface.textureType === 'ice'
                    ? '#38bdf8'
                    : surface.textureType === 'wood'
                    ? '#d97706'
                    : surface.textureType === 'carpet'
                    ? '#6366f1'
                    : surface.textureType === 'sandpaper'
                    ? '#ea580c'
                    : '#db2777'
                }
              />
              <text x="80" y="140" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                {surface.name.toUpperCase()} (Zoom)
              </text>

              <rect x="15" y="66" width="130" height="28" rx="6" fill="#000000" opacity="0.8" />
              <text x="80" y="78" textAnchor="middle" fill="#facc15" fontSize="8" fontWeight="bold">
                {simState.isMoving ? 'SKIPPING OVER PEAKS!' : 'PEAKS LOCKED TOGETHER!'}
              </text>
              <text x="80" y="89" textAnchor="middle" fill="#ffffff" fontSize="7.5">
                {simState.isMoving ? 'Kinetic friction is lower' : 'Static friction grips hard'}
              </text>
            </g>

            <path d="M 25 35 A 72 72 0 0 1 120 20 A 72 72 0 0 0 35 70 Z" fill="#ffffff" opacity="0.25" />
            <line x1="25" y1="135" x2="5" y2="155" stroke="#4c1d95" strokeWidth="8" strokeLinecap="round" />
            <circle cx="80" cy="80" r="76" fill="none" stroke="#a78bfa" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* DUAL IN-WINDOW SLIDERS: PUSH FORCE & SURFACE FRICTION */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 px-5 py-3.5 border-t-2 border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        {/* 1. In-Window Push Force Slider */}
        <div className="flex flex-col gap-1.5 bg-white/70 backdrop-blur-xs p-3 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase">
              <span>💪 Push Force:</span>
              <span className="text-sm font-black text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-300">
                {pushForce} N
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChangePushForce(Math.max(0, pushForce - 50))}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition"
              >
                -50
              </button>
              <button
                onClick={() => onChangePushForce(Math.min(2000, pushForce + 50))}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition"
              >
                +50
              </button>
              <button
                onClick={() => onChangePushForce(Math.min(2000, pushForce + 250))}
                className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px] rounded-lg transition"
              >
                +250
              </button>
              <button
                onClick={() => onChangePushForce(0)}
                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 transition"
              >
                0 N
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-400">0 N</span>
            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={pushForce}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangePushForce(val);
              }}
              className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            <span className="text-[11px] font-bold text-blue-700 font-black">2000 N</span>
          </div>
        </div>

        {/* 2. In-Window Surface Friction Slider */}
        <div className="flex flex-col gap-1.5 bg-white/70 backdrop-blur-xs p-3 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase">
              <span>🏁 Floor Friction (μ):</span>
              <span className="text-sm font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                μ = {surfaceFriction.toFixed(2)}
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  onResetPosition();
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition"
                title="Reset position to start"
              >
                ⏮️ 0m
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onResetAll();
                }}
                className="px-2.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-[11px] rounded-lg border border-amber-300 shadow-xs transition active:scale-95 flex items-center gap-1"
                title="Reset everything to starting defaults (100m, μ = 0.55, 200 kg Piano, 0 N, 0 m)"
              >
                <span>🔄</span>
                <span>Reset All</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-400">μ = 0.05 (Slick)</span>
            <input
              type="range"
              min="0.05"
              max="1.20"
              step="0.05"
              value={surfaceFriction}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangeSurfaceFriction(val);
              }}
              className="w-full h-2.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            <span className="text-[11px] font-bold text-emerald-700 font-black">μ = 1.20 (Sticky)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ANIMATED PUSHING CHARACTERS ====================

interface AnimatedCharacterProps {
  simState: SimState;
  isStrainingHard: boolean;
  pushRatio: number;
  stridePhase: number;
  boxH: number;
}

const LeoCharacter: React.FC<AnimatedCharacterProps> = ({
  simState,
  isStrainingHard,
  pushRatio,
  stridePhase,
  boxH,
}) => {
  const isMoving = simState.isMoving;
  const isPushing = simState.pushForce > 0;

  const leanForward = isMoving ? 22 : isPushing ? Math.min(26, 12 + pushRatio * 14) : 0;
  const bodyX = -48 - (isPushing ? pushRatio * 8 : 0);
  const bodyY = isMoving ? Math.abs(Math.sin(stridePhase)) * -4 : 0;

  const leg1Angle = isMoving ? Math.sin(stridePhase) * 28 : isPushing ? -25 : -4;
  const leg2Angle = isMoving ? -Math.sin(stridePhase) * 28 : isPushing ? 20 : 4;

  return (
    <g transform={`translate(${bodyX}, ${bodyY})`}>
      {/* Back leg */}
      <g transform={`translate(22, -26) rotate(${leg1Angle})`}>
        <line x1="0" y1="0" x2="-8" y2="28" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
        <rect x="-16" y="24" width="16" height="7" rx="3.5" fill="#dc2626" />
      </g>

      {/* Torso & Head */}
      <g transform={`translate(24, -28) rotate(${leanForward})`}>
        <rect x="-14" y="-12" width="28" height="16" rx="4" fill="#334155" />
        <rect x="-13" y="-46" width="26" height="36" rx="6" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2.5" />
        <line x1="-5" y1="-46" x2="-5" y2="-12" stroke="#1d4ed8" strokeWidth="2" />
        <line x1="5" y1="-46" x2="5" y2="-12" stroke="#1d4ed8" strokeWidth="2" />

        {/* Head */}
        <g transform="translate(4, -62)">
          <circle
            cx="0"
            cy="0"
            r="17"
            fill={isStrainingHard ? '#fecaca' : '#fed7aa'}
            stroke="#475569"
            strokeWidth="2.5"
          />
          <path d="M -16 -4 Q 0 -22 16 -6 Q 10 -16 -4 -16 Q -14 -16 -16 -4 Z" fill="#78350f" />

          {isStrainingHard ? (
            <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="-6" y1="-3" x2="0" y2="1" />
              <line x1="-6" y1="1" x2="0" y2="-3" />
              <line x1="6" y1="-3" x2="12" y2="1" />
              <line x1="6" y1="1" x2="12" y2="-3" />
            </g>
          ) : isMoving ? (
            <g fill="#1e293b">
              <circle cx="-3" cy="-1" r="2.5" />
              <circle cx="8" cy="-1" r="2.5" />
              <circle cx="-2" cy="-2" r="1" fill="#ffffff" />
              <circle cx="9" cy="-2" r="1" fill="#ffffff" />
            </g>
          ) : (
            <g fill="#1e293b">
              <circle cx="-3" cy="-1" r="2.5" />
              <circle cx="8" cy="-1" r="2.5" />
            </g>
          )}

          {isStrainingHard ? (
            <path d="M -4 9 Q 3 5 10 9" stroke="#b91c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : isMoving ? (
            <path d="M -3 6 Q 3 14 9 6" fill="#dc2626" stroke="#475569" strokeWidth="1.5" />
          ) : (
            <path d="M -2 7 Q 3 11 8 7" stroke="#475569" strokeWidth="2" fill="none" />
          )}

          {isStrainingHard && (
            <g fill="#38bdf8">
              <circle cx="16" cy="-8" r="3.5" />
              <circle cx="-16" cy="-4" r="2.5" />
            </g>
          )}
        </g>
      </g>

      {/* Front leg */}
      <g transform={`translate(26, -26) rotate(${leg2Angle})`}>
        <line x1="0" y1="0" x2="10" y2="28" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
        <rect x="4" y="24" width="16" height="7" rx="3.5" fill="#dc2626" />
      </g>

      {/* Arms pushing firmly on box */}
      {isPushing ? (
        <g stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M 18 -62 L 34 -52 L ${-bodyX} ${-boxH * 0.55}`} opacity="0.8" />
          <path d={`M 26 -58 L 44 -48 L ${-bodyX} ${-boxH * 0.45}`} />
          <ellipse cx={-bodyX - 2} cy={-boxH * 0.5} rx="4" ry="7" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
        </g>
      ) : (
        <g stroke="#1d4ed8" strokeWidth="7" strokeLinecap="round">
          <path d="M 18 -62 L 14 -32" />
          <path d="M 28 -58 L 32 -32" />
        </g>
      )}
    </g>
  );
};

const MayaCharacter: React.FC<AnimatedCharacterProps> = ({
  simState,
  isStrainingHard,
  pushRatio,
  stridePhase,
  boxH,
}) => {
  const isMoving = simState.isMoving;
  const isPushing = simState.pushForce > 0;

  const leanForward = isMoving ? 22 : isPushing ? Math.min(26, 12 + pushRatio * 14) : 0;
  const bodyX = -48 - (isPushing ? pushRatio * 8 : 0);
  const bodyY = isMoving ? Math.abs(Math.sin(stridePhase)) * -4 : 0;

  const leg1Angle = isMoving ? Math.sin(stridePhase) * 28 : isPushing ? -25 : -4;
  const leg2Angle = isMoving ? -Math.sin(stridePhase) * 28 : isPushing ? 20 : 4;

  return (
    <g transform={`translate(${bodyX}, ${bodyY})`}>
      <g transform={`translate(22, -26) rotate(${leg1Angle})`}>
        <line x1="0" y1="0" x2="-8" y2="28" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
        <rect x="-16" y="24" width="16" height="7" rx="3.5" fill="#06b6d4" />
      </g>

      <g transform={`translate(24, -28) rotate(${leanForward})`}>
        <rect x="-14" y="-12" width="28" height="16" rx="4" fill="#1e293b" />
        <rect x="-13" y="-46" width="26" height="36" rx="6" fill="#db2777" stroke="#be185d" strokeWidth="2.5" />
        <text x="0" y="-24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="black">
          7
        </text>

        <g transform="translate(4, -62)">
          <circle cx="-16" cy="-4" r="9" fill="#451a03" />
          <path d="M -16 -4 C -26 4, -30 18, -24 26 C -20 20, -14 12, -14 4 Z" fill="#451a03" />
          <circle cx="0" cy="0" r="17" fill={isStrainingHard ? '#fecaca' : '#fed7aa'} stroke="#475569" strokeWidth="2.5" />
          <path d="M -14 -4 Q 0 -18 14 -4 Q 8 -12 -2 -12 Q -10 -12 -14 -4 Z" fill="#451a03" />

          {isStrainingHard ? (
            <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="-6" y1="-3" x2="0" y2="1" />
              <line x1="-6" y1="1" x2="0" y2="-3" />
              <line x1="6" y1="-3" x2="12" y2="1" />
              <line x1="6" y1="1" x2="12" y2="-3" />
              <path d="M -4 9 Q 3 5 10 9" stroke="#b91c1c" strokeWidth="3" fill="none" />
            </g>
          ) : isMoving ? (
            <g fill="#1e293b">
              <circle cx="-3" cy="-1" r="2.5" />
              <circle cx="8" cy="-1" r="2.5" />
              <path d="M -3 6 Q 3 14 9 6" fill="#db2777" stroke="#475569" strokeWidth="1.5" />
            </g>
          ) : (
            <g fill="#1e293b">
              <circle cx="-3" cy="-1" r="2.5" />
              <circle cx="8" cy="-1" r="2.5" />
              <path d="M -2 7 Q 3 11 8 7" stroke="#475569" strokeWidth="2" fill="none" />
            </g>
          )}

          {isStrainingHard && <circle cx="16" cy="-8" r="3.5" fill="#38bdf8" />}
        </g>
      </g>

      <g transform={`translate(26, -26) rotate(${leg2Angle})`}>
        <line x1="0" y1="0" x2="10" y2="28" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
        <rect x="4" y="24" width="16" height="7" rx="3.5" fill="#06b6d4" />
      </g>

      {isPushing ? (
        <g stroke="#be185d" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M 18 -62 L 34 -52 L ${-bodyX} ${-boxH * 0.55}`} opacity="0.8" />
          <path d={`M 26 -58 L 44 -48 L ${-bodyX} ${-boxH * 0.45}`} />
          <ellipse cx={-bodyX - 2} cy={-boxH * 0.5} rx="4" ry="7" fill="#fed7aa" stroke="#78350f" strokeWidth="1.5" />
        </g>
      ) : (
        <g stroke="#be185d" strokeWidth="7" strokeLinecap="round">
          <path d="M 18 -62 L 14 -32" />
          <path d="M 28 -58 L 32 -32" />
        </g>
      )}
    </g>
  );
};

const BotCharacter: React.FC<AnimatedCharacterProps> = ({
  simState,
  isStrainingHard,
  pushRatio,
  stridePhase,
  boxH,
}) => {
  const isMoving = simState.isMoving;
  const isPushing = simState.pushForce > 0;

  const leanForward = isMoving ? 18 : isPushing ? Math.min(22, 8 + pushRatio * 14) : 0;
  const bodyX = -46 - (isPushing ? pushRatio * 6 : 0);

  return (
    <g transform={`translate(${bodyX}, 0)`}>
      <rect x="0" y="-18" width="46" height="18" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="10" cy="-9" r="5" fill="#94a3b8" />
      <circle cx="23" cy="-9" r="5" fill="#94a3b8" />
      <circle cx="36" cy="-9" r="5" fill="#94a3b8" />

      <g transform={`translate(24, -18) rotate(${leanForward})`}>
        <rect x="-14" y="-36" width="28" height="34" rx="6" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2.5" />
        <rect x="-8" y="-28" width="16" height="8" rx="2" fill="#0f172a" />
        <line
          x1="-6"
          y1="-24"
          x2={-6 + pushRatio * 12}
          y2="-24"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <g transform="translate(0, -50)">
          <rect x="-15" y="-16" width="30" height="24" rx="6" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
          <rect x="-10" y="-10" width="20" height="12" rx="3" fill="#0f172a" />
          <circle cx="-4" cy="-4" r="2.5" fill={isStrainingHard ? '#ef4444' : '#38bdf8'} />
          <circle cx="4" cy="-4" r="2.5" fill={isStrainingHard ? '#ef4444' : '#38bdf8'} />
          <line x1="0" y1="-16" x2="0" y2="-25" stroke="#475569" strokeWidth="2.5" />
          <circle cx="0" cy="-26" r="4" fill={isStrainingHard ? '#ef4444' : isMoving ? '#22c55e' : '#eab308'} />
        </g>
      </g>

      {isPushing ? (
        <g stroke="#0369a1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M 18 -46 L 36 -38 L ${-bodyX} ${-boxH * 0.52}`} />
          <rect x={-bodyX - 4} y={-boxH * 0.55} width="6" height="12" rx="2" fill="#334155" />
        </g>
      ) : (
        <g stroke="#0369a1" strokeWidth="7" strokeLinecap="round">
          <path d="M 18 -46 L 10 -22" />
          <path d="M 28 -46 L 36 -22" />
        </g>
      )}
    </g>
  );
};

// ==================== OBJECT SVG COMPONENTS ====================

const GiftBoxSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g>
    <rect width={width} height={height} rx="8" fill="#f43f5e" stroke="#be123c" strokeWidth="3" />
    <circle cx={width * 0.25} cy={height * 0.28} r="5" fill="#fecdd3" opacity="0.6" />
    <circle cx={width * 0.75} cy={height * 0.28} r="5" fill="#fecdd3" opacity="0.6" />
    <circle cx={width * 0.25} cy={height * 0.72} r="5" fill="#fecdd3" opacity="0.6" />
    <circle cx={width * 0.75} cy={height * 0.72} r="5" fill="#fecdd3" opacity="0.6" />

    <rect x={width * 0.42} y="0" width={width * 0.16} height={height} fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
    <rect x="0" y={height * 0.42} width={width} height={height * 0.16} fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />

    <g transform={`translate(${width / 2}, 0)`}>
      <path d="M 0 0 C -20 -22, -28 -5, 0 0 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
      <path d="M 0 0 C 20 -22, 28 -5, 0 0 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
      <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
    </g>
  </g>
);

const CrateSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g>
    <rect width={width} height={height} rx="6" fill="#b45309" stroke="#78350f" strokeWidth="3" />
    <rect x="6" y="6" width={width - 12} height={height - 12} fill="#d97706" stroke="#92400e" strokeWidth="2" />
    <line x1="6" y1={height * 0.35} x2={width - 6} y2={height * 0.35} stroke="#78350f" strokeWidth="2" />
    <line x1="6" y1={height * 0.65} x2={width - 6} y2={height * 0.65} stroke="#78350f" strokeWidth="2" />

    <line x1="6" y1="6" x2={width - 6} y2={height - 6} stroke="#92400e" strokeWidth="4" opacity="0.6" />
    <line x1="6" y1={height - 6} x2={width - 6} y2={6} stroke="#92400e" strokeWidth="4" opacity="0.6" />

    <rect x="0" y="0" width="14" height="14" fill="#334155" />
    <rect x={width - 14} y="0" width="14" height="14" fill="#334155" />
    <rect x="0" y={height - 14} width="14" height="14" fill="#334155" />
    <rect x={width - 14} y={height - 14} width="14" height="14" fill="#334155" />

    <circle cx="7" cy="7" r="2" fill="#cbd5e1" />
    <circle cx={width - 7} cy="7" r="2" fill="#cbd5e1" />
    <circle cx="7" cy={height - 7} r="2" fill="#cbd5e1" />
    <circle cx={width - 7} cy={height - 7} r="2" fill="#cbd5e1" />

    <text x={width / 2} y={height * 0.3} textAnchor="middle" fill="#451a03" fontSize="9" fontWeight="black">
      HANDLE WITH CARE
    </text>
  </g>
);

const TreasureChestSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g>
    <path
      d={`M 6 18 Q ${width / 2} -4 ${width - 6} 18 L ${width - 4} ${height} L 4 ${height} Z`}
      fill="#854d0e"
      stroke="#451a03"
      strokeWidth="3"
    />
    <rect x="4" y={height * 0.4} width={width - 8} height="12" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
    <rect x={width * 0.22} y="10" width="10" height={height - 10} fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
    <rect x={width * 0.68} y="10" width="10" height={height - 10} fill="#eab308" stroke="#a16207" strokeWidth="1.5" />

    <circle cx={width / 2} cy={height * 0.46} r="10" fill="#fde047" stroke="#854d0e" strokeWidth="2" />
    <circle cx={width / 2} cy={height * 0.44} r="3" fill="#0f172a" />
    <polygon
      points={`${width / 2 - 2} ${height * 0.44}, ${width / 2 + 2} ${height * 0.44}, ${width / 2 + 1} ${height * 0.52}, ${width / 2 - 1} ${height * 0.52}`}
      fill="#0f172a"
    />
  </g>
);

const BankSafeSVG: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <g>
    <rect width={width} height={height} rx="8" fill="#334155" stroke="#0f172a" strokeWidth="4" />
    <rect x="10" y="10" width={width - 20} height={height - 20} rx="6" fill="#475569" stroke="#1e293b" strokeWidth="3" />

    <circle cx={width * 0.42} cy={height * 0.45} r="24" fill="#64748b" stroke="#0f172a" strokeWidth="3" />
    <circle cx={width * 0.42} cy={height * 0.45} r="18" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1={width * 0.42}
        y1={height * 0.45 - 18}
        x2={width * 0.42}
        y2={height * 0.45 - 13}
        stroke="#1e293b"
        strokeWidth="1.5"
        transform={`rotate(${deg}, ${width * 0.42}, ${height * 0.45})`}
      />
    ))}
    <circle cx={width * 0.42} cy={height * 0.45} r="6" fill="#0f172a" />
    <line x1={width * 0.42 - 14} y1={height * 0.45} x2={width * 0.42 + 14} y2={height * 0.45} stroke="#0f172a" strokeWidth="3" />
    <line x1={width * 0.42} y1={height * 0.45 - 14} x2={width * 0.42} y2={height * 0.45 + 14} stroke="#0f172a" strokeWidth="3" />

    <g transform={`translate(${width * 0.78}, ${height * 0.45})`}>
      <rect x="-6" y="-18" width="12" height="36" rx="4" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" />
      <circle cx="0" cy="0" r="7" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
    </g>

    <circle cx="16" cy="16" r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
    <circle cx={width - 16} cy="16" r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
    <circle cx="16" cy={height - 16} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
    <circle cx={width - 16} cy={height - 16} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
  </g>
);

const PianoSVG: React.FC<{ width: number; height: number; isMoving: boolean }> = ({ width, height, isMoving }) => {
  const keyHeight = 16;
  const keyY = height - 28;
  const numWhiteKeys = 10;
  const whiteKeyWidth = (width - 16) / numWhiteKeys;

  return (
    <g>
      {/* Upper Main Piano Body (Polished Ebony) */}
      <rect
        x="4"
        y="8"
        width={width - 8}
        height={height - 18}
        rx="8"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="3"
      />

      {/* Gloss reflection highlight */}
      <path
        d={`M 10 14 L ${width - 10} 14 L ${width - 10} 24 L 10 32 Z`}
        fill="#ffffff"
        opacity="0.12"
      />

      {/* Piano curved top rim / lid accent */}
      <path
        d={`M 8 16 Q ${width * 0.4} 6 ${width - 8} 16`}
        stroke="#ca8a04"
        strokeWidth="2"
        fill="none"
      />

      {/* Music Stand & Sheet Music */}
      <g transform={`translate(${width * 0.38}, 0)`}>
        {/* Wooden Music Rack */}
        <rect x="-4" y="6" width="36" height="14" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        {/* Open Sheet Music */}
        <rect x="0" y="2" width="13" height="14" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x="15" y="2" width="13" height="14" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Stave lines */}
        <line x1="2" y1="5" x2="11" y2="5" stroke="#64748b" strokeWidth="0.8" />
        <line x1="2" y1="8" x2="11" y2="8" stroke="#64748b" strokeWidth="0.8" />
        <line x1="2" y1="11" x2="11" y2="11" stroke="#64748b" strokeWidth="0.8" />
        <line x1="17" y1="5" x2="26" y2="5" stroke="#64748b" strokeWidth="0.8" />
        <line x1="17" y1="8" x2="26" y2="8" stroke="#64748b" strokeWidth="0.8" />
        <line x1="17" y1="11" x2="26" y2="11" stroke="#64748b" strokeWidth="0.8" />
        {/* Mini music note symbol */}
        <text x="6" y="10" fill="#0f172a" fontSize="6" fontWeight="bold">♪</text>
        <text x="21" y="10" fill="#0f172a" fontSize="6" fontWeight="bold">♫</text>
      </g>

      {/* Floating music notes when in motion! */}
      {isMoving && (
        <g transform={`translate(${width * 0.72}, -6)`}>
          <text x="0" y="0" fill="#f59e0b" fontSize="12" fontWeight="black" opacity="0.9">♪</text>
          <text x="10" y="-8" fill="#38bdf8" fontSize="10" fontWeight="black" opacity="0.8">♫</text>
          <text x="18" y="-14" fill="#a855f7" fontSize="8" fontWeight="black" opacity="0.7">♩</text>
        </g>
      )}

      {/* Fallboard with Gold Brand Stamp */}
      <rect x="8" y={keyY - 14} width={width - 16} height="12" fill="#1e293b" />
      <text
        x={width / 2}
        y={keyY - 5}
        textAnchor="middle"
        fill="#facc15"
        fontSize="7.5"
        fontWeight="black"
        letterSpacing="1"
      >
        CONCERT GRAND
      </text>

      {/* Red Felt Dust Strip above keys */}
      <rect x="8" y={keyY - 2} width={width - 16} height="2.5" fill="#dc2626" />

      {/* KEYBOARD BED */}
      <g transform={`translate(8, ${keyY})`}>
        {/* White Keys */}
        {Array.from({ length: numWhiteKeys }).map((_, i) => (
          <g key={i}>
            <rect
              x={i * whiteKeyWidth}
              y="0"
              width={whiteKeyWidth - 0.5}
              height={keyHeight}
              rx="1.5"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Black Keys (Sharps & Flats in authentic grouping) */}
        {[0, 1, 3, 4, 5, 7, 8].map((k) => (
          <rect
            key={k}
            x={(k + 0.65) * whiteKeyWidth}
            y="0"
            width={whiteKeyWidth * 0.65}
            height={keyHeight * 0.62}
            rx="1"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* Lower Cabinet Frame */}
      <rect
        x="10"
        y={keyY + keyHeight}
        width={width - 20}
        height={height - (keyY + keyHeight) - 8}
        fill="#0f172a"
      />

      {/* Sturdy Side Legs with Brass Casters */}
      {/* Left leg */}
      <rect x="8" y={keyY + keyHeight} width="12" height={height - (keyY + keyHeight) - 4} rx="2" fill="#1e293b" />
      <circle cx="14" cy={height - 2} r="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

      {/* Right leg */}
      <rect x={width - 20} y={keyY + keyHeight} width="12" height={height - (keyY + keyHeight) - 4} rx="2" fill="#1e293b" />
      <circle cx={width - 14} cy={height - 2} r="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

      {/* Center Lyre with 3 Gold Brass Pedals */}
      <g transform={`translate(${width / 2}, ${height - 12})`}>
        <rect x="-8" y="0" width="16" height="8" rx="2" fill="#1e293b" />
        {/* 3 Pedals */}
        <rect x="-6" y="5" width="3" height="6" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
        <rect x="-1.5" y="5" width="3" height="6" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
        <rect x="3" y="5" width="3" height="6" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
      </g>
    </g>
  );
};
