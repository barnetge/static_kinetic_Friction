import React from 'react';
import { VectorDisplayOptions } from '../types/physics';
import { Eye, EyeOff, CheckSquare, Square, Info } from 'lucide-react';
import { sound } from '../utils/audio';

interface VectorControlsProps {
  options: VectorDisplayOptions;
  onChangeOptions: (newOptions: VectorDisplayOptions) => void;
}

export const VectorControls: React.FC<VectorControlsProps> = ({
  options,
  onChangeOptions,
}) => {
  const allVectorsOn =
    options.showAppliedForce &&
    options.showFriction &&
    options.showNetForce &&
    options.showVerticalForces &&
    options.showActionReaction;

  const toggleAll = () => {
    sound.playClick();
    const nextState = !allVectorsOn;
    onChangeOptions({
      ...options,
      showAppliedForce: nextState,
      showFriction: nextState,
      showNetForce: nextState,
      showVerticalForces: nextState,
      showActionReaction: nextState,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
      {/* Label and Master Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🎯</span>
          <span className="text-sm font-extrabold text-slate-800">
            Force Vector Arrows:
          </span>
        </div>

        <button
          onClick={toggleAll}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
            allVectorsOn
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          {allVectorsOn ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{allVectorsOn ? 'Hide All' : 'Show All'}</span>
        </button>
      </div>

      {/* Individual Vector Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Applied Push Force */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeOptions({
              ...options,
              showAppliedForce: !options.showAppliedForce,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border-2 ${
            options.showAppliedForce
              ? 'bg-blue-50 text-blue-800 border-blue-500 shadow-xs ring-1 ring-blue-300'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span>Applied Push (F_push)</span>
        </button>

        {/* Friction Force */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeOptions({
              ...options,
              showFriction: !options.showFriction,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border-2 ${
            options.showFriction
              ? 'bg-rose-50 text-rose-800 border-rose-500 shadow-xs ring-1 ring-rose-300'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
          <span>Friction Force (F_f)</span>
        </button>

        {/* Net Force */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeOptions({
              ...options,
              showNetForce: !options.showNetForce,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border-2 ${
            options.showNetForce
              ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs ring-1 ring-emerald-300'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
          <span>Net Force (F_net)</span>
        </button>

        {/* Vertical Forces (Gravity & Normal) */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeOptions({
              ...options,
              showVerticalForces: !options.showVerticalForces,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border-2 ${
            options.showVerticalForces
              ? 'bg-purple-50 text-purple-800 border-purple-500 shadow-xs ring-1 ring-purple-300'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
          <span>Vertical (Gravity & Floor)</span>
        </button>

        {/* Action-Reaction Forces (Newton's 3rd Law Pairs) */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeOptions({
              ...options,
              showActionReaction: !options.showActionReaction,
            });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border-2 ${
            options.showActionReaction
              ? 'bg-amber-50 text-amber-900 border-amber-500 shadow-xs ring-1 ring-amber-300'
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
          }`}
          title="Toggle Newton's 3rd Law Action-Reaction pairs (equal & opposite partner forces on hands and floor)"
        >
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span>Action-Reaction Pairs (3rd Law)</span>
        </button>

        {/* Show Values in Newtons Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeOptions({
              ...options,
              showValues: !options.showValues,
            });
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
            options.showValues
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title="Toggle numerical force values on vector arrows"
        >
          {options.showValues ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Show Numbers (N)</span>
        </button>
      </div>
    </div>
  );
};
