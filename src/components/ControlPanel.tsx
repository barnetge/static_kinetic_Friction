import React from 'react';
import { Surface, PushObject, SURFACES, PUSH_OBJECTS } from '../types/physics';
import { Sliders, RotateCcw, Play, Pause, FastForward, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface ControlPanelProps {
  currentSurface: Surface;
  onSelectSurface: (surface: Surface) => void;
  customStaticMu: number;
  customKineticMu: number;
  isCustomFriction: boolean;
  onUpdateCustomFriction: (staticMu: number, kineticMu: number) => void;
  onToggleCustomFriction: (enable: boolean) => void;

  currentObject: PushObject;
  onSelectObject: (obj: PushObject) => void;
  customMass: number;
  isCustomMass: boolean;
  onUpdateCustomMass: (mass: number) => void;
  onToggleCustomMass: (enable: boolean) => void;

  pushForce: number;
  onChangePushForce: (force: number) => void;

  isPaused: boolean;
  onTogglePause: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onResetAll: () => void;

  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentSurface,
  onSelectSurface,
  customStaticMu,
  customKineticMu,
  isCustomFriction,
  onUpdateCustomFriction,
  onToggleCustomFriction,

  currentObject,
  onSelectObject,
  customMass,
  isCustomMass,
  onUpdateCustomMass,
  onToggleCustomMass,

  pushForce,
  onChangePushForce,

  isPaused,
  onTogglePause,
  simSpeed,
  onChangeSimSpeed,
  onResetAll,

  isAudioEnabled,
  onToggleAudio,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. APPLIED PUSH FORCE CONTROLS */}
      <div className="bg-white rounded-3xl p-5 border-3 border-blue-200 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-black">
                💪
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Push Force</h3>
                <p className="text-xs text-slate-500 font-semibold">How hard to push the object</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-2xl border-2 border-blue-200 inline-block">
                {pushForce} N
              </span>
            </div>
          </div>

          {/* Big Slider */}
          <div className="mt-4">
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
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
              <span>0 N</span>
              <span>1000 N</span>
              <span>2000 N (Max Turbo!)</span>
            </div>
          </div>

          {/* Quick Increment Buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            <button
              onClick={() => {
                onChangePushForce(Math.max(0, pushForce - 50));
                sound.playClick();
              }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-xs rounded-xl transition"
            >
              -50 N
            </button>
            <button
              onClick={() => {
                onChangePushForce(Math.min(2000, pushForce + 50));
                sound.playClick();
              }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-xs rounded-xl transition"
            >
              +50 N
            </button>
            <button
              onClick={() => {
                onChangePushForce(Math.min(2000, pushForce + 250));
                sound.playClick();
              }}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 font-extrabold text-xs rounded-xl transition border border-blue-200"
            >
              +250 N
            </button>
            <button
              onClick={() => {
                onChangePushForce(0);
                sound.playClick();
              }}
              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-extrabold text-xs rounded-xl transition border border-rose-200"
            >
              Let Go (0 N)
            </button>
          </div>
        </div>

        {/* Play/Pause, Sim Speed & Audio Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => onChangeSimSpeed(simSpeed === 1 ? 0.5 : 1)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                simSpeed === 0.5
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Slow down time to clearly see breakaway!"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{simSpeed === 0.5 ? '0.5x Slow-Mo' : '1x Normal'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleAudio}
              className={`p-2 rounded-xl text-xs font-bold transition border ${
                isAudioEnabled
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
              title={isAudioEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onResetAll}
              className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
              title="Reset everything to starting values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHOOSE OBJECT & MASS */}
      <div className="bg-white rounded-3xl p-5 border-3 border-amber-200 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-black">
                ⚖️
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Object & Mass</h3>
                <p className="text-xs text-slate-500 font-semibold">Heavier objects press down with more gravity</p>
              </div>
            </div>
            <button
              onClick={() => onToggleCustomMass(!isCustomMass)}
              className={`text-[11px] font-bold px-2 py-1 rounded-xl border transition ${
                isCustomMass
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isCustomMass ? 'Custom Slider' : 'Presets'}
            </button>
          </div>

          {/* Object Selector Cards */}
          {!isCustomMass ? (
            <div className="grid grid-cols-5 gap-1.5 mt-2.5">
              {PUSH_OBJECTS.map((obj) => {
                const isSelected = currentObject.id === obj.id;
                return (
                  <button
                    key={obj.id}
                    onClick={() => {
                      onSelectObject(obj);
                      sound.playClick();
                    }}
                    className={`p-2 rounded-2xl flex flex-col items-center justify-center transition border-2 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 shadow-sm scale-102 ring-2 ring-amber-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="text-2xl mb-1">{obj.icon}</span>
                    <span className="text-[11px] font-extrabold text-slate-800 leading-tight text-center">
                      {obj.mass} kg
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">
                      {obj.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Mass Slider */
            <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex justify-between items-center text-xs font-bold text-amber-900 mb-2">
                <span>Custom Object Mass (kg)</span>
                <span className="text-base font-black text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-300">
                  {customMass} kg
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="250"
                step="2"
                value={customMass}
                onChange={(e) => onUpdateCustomMass(Number(e.target.value))}
                className="w-full h-2.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-amber-700 font-bold mt-1">
                <span>2 kg (Featherlight)</span>
                <span>125 kg (Heavy)</span>
                <span>250 kg (Huge!)</span>
              </div>
            </div>
          )}
        </div>

        {/* Mass Fact Footer */}
        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <span className="font-extrabold text-amber-700">Weight (F_g):</span>
          <span className="font-bold text-slate-800">
            {((isCustomMass ? customMass : currentObject.mass) * 9.8).toFixed(0)} N
          </span>
          <span className="text-[11px] text-slate-400">
            (Normal force pushing back up is equal!)
          </span>
        </div>
      </div>

      {/* 3. CHOOSE FLOOR SURFACE & ADJUST FRICTION */}
      <div className="bg-white rounded-3xl p-5 border-3 border-emerald-200 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                🏁
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Floor Surface & Friction (μ)</h3>
                <p className="text-xs text-slate-500 font-semibold">Rougher surfaces have higher friction</p>
              </div>
            </div>
            <button
              onClick={() => onToggleCustomFriction(!isCustomFriction)}
              className={`text-[11px] font-bold px-2 py-1 rounded-xl border transition ${
                isCustomFriction
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isCustomFriction ? 'Custom Friction' : 'Surface Presets'}
            </button>
          </div>

          {/* Surface Preset Cards */}
          {!isCustomFriction ? (
            <div className="grid grid-cols-5 gap-1.5 mt-2.5">
              {SURFACES.map((surf) => {
                const isSelected = currentSurface.id === surf.id;
                return (
                  <button
                    key={surf.id}
                    onClick={() => {
                      onSelectSurface(surf);
                      sound.playClick();
                    }}
                    className={`p-2 rounded-2xl flex flex-col items-center justify-center transition border-2 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm scale-102 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="text-2xl mb-1">{surf.icon}</span>
                    <span className="text-[10px] font-extrabold text-slate-800 leading-tight text-center truncate w-full">
                      {surf.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">
                      μ = {surf.staticMu}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Friction Slider */
            <div className="mt-2.5 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2.5">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-emerald-950">
                  <span>Static Friction Grip (μ)</span>
                  <span className="font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                    μ = {customStaticMu.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.50"
                  step="0.05"
                  value={customStaticMu}
                  onChange={(e) => {
                    const newStatic = Number(e.target.value);
                    // Ensure kinetic is always <= static
                    const newKinetic = Math.min(customKineticMu, newStatic * 0.85);
                    onUpdateCustomFriction(newStatic, Number(newKinetic.toFixed(2)));
                  }}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-emerald-950">
                  <span>Kinetic Sliding Drag (μ_k)</span>
                  <span className="font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
                    μ_k = {customKineticMu.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max={Math.max(0.05, customStaticMu)}
                  step="0.02"
                  value={customKineticMu}
                  onChange={(e) => onUpdateCustomFriction(customStaticMu, Number(e.target.value))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-1"
                />
                <div className="text-[9.5px] text-emerald-700 font-semibold italic mt-0.5">
                  Kinetic friction is almost always lower than static friction!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fun Floor Fact */}
        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>🔍</span>
          <span className="truncate">{currentSurface.kidFact}</span>
        </div>
      </div>
    </div>
  );
};
