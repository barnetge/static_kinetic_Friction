import React from 'react';
import { SimState } from '../types/physics';
import { ArrowRight, Lock, Zap, Gauge } from 'lucide-react';

interface ForceMeterProps {
  simState: SimState;
  maxMeterForce?: number;
}

export const ForceMeter: React.FC<ForceMeterProps> = ({
  simState,
  maxMeterForce = 500,
}) => {
  // Percentages for visual linear force bars (clamped 0 to 100%)
  const pushPct = Math.min(100, (simState.pushForce / maxMeterForce) * 100);
  const frictionPct = Math.min(100, (simState.currentFriction / maxMeterForce) * 100);
  const breakawayPct = Math.min(100, (simState.maxStaticFriction / maxMeterForce) * 100);
  const kineticPct = Math.min(100, (simState.kineticFriction / maxMeterForce) * 100);

  // Status message
  let statusBadge = {
    title: 'Balanced Forces (At Rest)',
    desc: 'Static friction matches your push exactly. Net force is 0 N.',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: <Lock className="w-4 h-4 text-amber-700" />,
  };

  if (simState.isMoving) {
    if (simState.netForce > 1) {
      statusBadge = {
        title: 'Unbalanced Forces (Speeding Up!)',
        desc: `Push (${simState.pushForce.toFixed(0)} N) beats kinetic friction (${simState.currentFriction.toFixed(0)} N)! Net Force is +${simState.netForce.toFixed(0)} N!`,
        color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: <Zap className="w-4 h-4 text-emerald-700" />,
      };
    } else if (Math.abs(simState.netForce) <= 1) {
      statusBadge = {
        title: 'Balanced Forces (Gliding at Constant Speed!)',
        desc: `Push exactly balances kinetic friction! Velocity stays steady at ${simState.velocity.toFixed(1)} m/s!`,
        color: 'bg-blue-100 text-blue-900 border-blue-300',
        icon: <ArrowRight className="w-4 h-4 text-blue-700" />,
      };
    } else {
      statusBadge = {
        title: 'Unbalanced Forces (Slowing Down!)',
        desc: `Friction (${simState.currentFriction.toFixed(0)} N) is stronger than push! Box is slowing down!`,
        color: 'bg-rose-100 text-rose-900 border-rose-300',
        icon: <Gauge className="w-4 h-4 text-rose-700" />,
      };
    }
  } else if (simState.pushForce === 0) {
    statusBadge = {
      title: 'Resting (No Force)',
      desc: 'No push applied. Push the slider or buttons to test friction!',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: <span className="text-base">⏸️</span>,
    };
  }

  return (
    <div className="bg-white rounded-3xl p-5 border-3 border-sky-200 shadow-md flex flex-col gap-4">
      {/* Header with Title and Live Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
            📊
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Live Force Meter
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Comparing Push Force vs Opposing Friction in real time
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-bold ${statusBadge.color}`}
        >
          {statusBadge.icon}
          <div>
            <span>{statusBadge.title}</span>
          </div>
        </div>
      </div>

      {/* Main Dual Force Comparison Bar */}
      <div className="space-y-4">
        {/* Applied Push Force Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-extrabold mb-1.5">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
              Applied Push Force (F_push)
            </span>
            <span className="text-sm font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              {simState.pushForce.toFixed(0)} N
            </span>
          </div>
          <div className="relative h-6 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
            {/* Breakaway threshold target line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 flex flex-col items-center pointer-events-none"
              style={{ left: `${breakawayPct}%` }}
            >
              <div className="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1 shadow-sm"></div>
            </div>
            {/* The bar */}
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-75 rounded-l-xl"
              style={{ width: `${pushPct}%` }}
            />
          </div>
        </div>

        {/* Friction Force Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-extrabold mb-1.5">
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
              Opposing Friction Force (F_friction)
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                {simState.isMoving ? 'Kinetic' : 'Static'}
              </span>
            </span>
            <span className="text-sm font-black text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
              {simState.currentFriction.toFixed(0)} N
            </span>
          </div>
          <div className="relative h-6 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
            {/* Kinetic friction level reference */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 pointer-events-none border-dashed border-l border-amber-600"
              style={{ left: `${kineticPct}%` }}
            />
            {/* The bar */}
            <div
              className={`h-full transition-all duration-75 rounded-l-xl ${
                simState.isMoving
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
              style={{ width: `${frictionPct}%` }}
            />
          </div>
        </div>

        {/* Breakaway Indicator Labels Bar */}
        <div className="relative text-[11px] font-bold text-slate-500 pt-1">
          <div className="flex justify-between items-center">
            <span>0 N</span>
            <span className="flex items-center gap-1 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Breakaway Static Peak: <strong>{simState.maxStaticFriction.toFixed(0)} N</strong>
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Kinetic Drag: <strong>{simState.kineticFriction.toFixed(0)} N</strong>
            </span>
            <span>{maxMeterForce} N</span>
          </div>
        </div>
      </div>

      {/* Net Force Card & The Elementary "Aha!" Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Net Force Meter Box */}
        <div
          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
            Math.abs(simState.netForce) > 0.5
              ? simState.netForce > 0
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-rose-50 border-rose-300'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Net Force (F_net = Push - Friction)
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{simState.netForce.toFixed(0)} N</span>
              {simState.netForce > 0 && <span className="text-emerald-600 text-sm font-extrabold">➡️ Forward</span>}
              {simState.netForce < 0 && <span className="text-rose-600 text-sm font-extrabold">⬅️ Braking</span>}
              {Math.abs(simState.netForce) <= 0.5 && (
                <span className="text-slate-500 text-xs font-bold">⚖️ Balanced!</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400">Acceleration</div>
            <div className="text-base font-black text-slate-800">
              {simState.acceleration.toFixed(2)} <span className="text-xs font-normal">m/s²</span>
            </div>
          </div>
        </div>

        {/* The "Why does it break free?" Kid-Friendly Insight Box */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 text-xs text-indigo-950 flex flex-col justify-center">
          <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
            <span>💡 Science Secret for Kids:</span>
          </div>
          <p className="mt-1 leading-snug font-medium text-[11.5px]">
            {!simState.isMoving ? (
              simState.pushForce === 0 ? (
                <>Push gently to watch <strong>Static Friction</strong> rise to resist you. It will lock until you beat <strong>{simState.maxStaticFriction.toFixed(0)} N</strong>!</>
              ) : (
                <>You are pushing with <strong>{simState.pushForce.toFixed(0)} N</strong>. Static friction pushes back with <strong>{simState.currentFriction.toFixed(0)} N</strong>! (Balanced!)</>
              )
            ) : (
              <>It broke free! Friction dropped from <strong>{simState.maxStaticFriction.toFixed(0)} N</strong> down to <strong>{simState.kineticFriction.toFixed(0)} N</strong>! It takes <em>less</em> push to keep it sliding!</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
