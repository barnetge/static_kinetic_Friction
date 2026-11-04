import React from 'react';
import { X, Trophy, CheckCircle, Circle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

export interface Challenge {
  id: string;
  title: string;
  category: string;
  description: string;
  badgeEmoji: string;
  completed: boolean;
}

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
  onSelectChallengeSetup?: (challengeId: string) => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  isOpen,
  onClose,
  challenges,
  onSelectChallengeSetup,
}) => {
  if (!isOpen) return null;

  const completedCount = challenges.filter((c) => c.completed).length;

  const handleCelebrate = () => {
    sound.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              ⭐
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-md inline-block">
                Elementary Science Lab
              </div>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                Classroom Friction Missions ({completedCount}/{challenges.length})
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {challenges.map((c, idx) => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border-2 transition ${
                c.completed
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl mt-0.5">{c.badgeEmoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                        Mission {idx + 1}
                      </span>
                      {c.completed && (
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed!
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 mt-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      {c.description}
                    </p>
                  </div>
                </div>

                {onSelectChallengeSetup && (
                  <button
                    onClick={() => {
                      onSelectChallengeSetup(c.id);
                      onClose();
                    }}
                    className="shrink-0 text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                  >
                    Try This!
                  </button>
                )}
              </div>
            </div>
          ))}

          {completedCount === challenges.length && (
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-center space-y-2 shadow-lg">
              <Award className="w-8 h-8 mx-auto" />
              <h4 className="font-black text-lg">🎉 Master of Friction Award!</h4>
              <p className="text-xs text-emerald-100 font-semibold">
                You understand the secret difference between static resistance and sliding kinetic friction!
              </p>
              <button
                onClick={handleCelebrate}
                className="px-4 py-2 bg-white text-emerald-800 font-black text-xs rounded-xl shadow-md hover:bg-emerald-50 transition"
              >
                Launch Celebration Confetti! 🎊
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-bold">
            Complete missions by experimenting with forces and surfaces!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition"
          >
            Back to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
