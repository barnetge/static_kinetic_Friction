import React, { useState } from 'react';
import { X, BookOpen, Compass, CheckCircle2, Sparkles, Award } from 'lucide-react';

interface NGSSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NGSSModal: React.FC<NGSSModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'standards' | 'questions' | 'rubric'>('standards');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-indigo-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  Grades K–8
                </span>
                <span className="text-xs text-indigo-100 font-semibold">
                  Next Generation Science Standards
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-0.5">
                NGSS Frameworks & Classroom Guide
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('standards')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold transition border-b-3 ${
              activeTab === 'standards'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Target Standards (K–8)</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold transition border-b-3 ${
              activeTab === 'questions'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Classroom Inquiry Challenges</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold transition border-b-3 ${
              activeTab === 'rubric'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Key Takeaways & Vocabulary</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {activeTab === 'standards' && (
            <div className="space-y-4">
              {/* Elementary Grade 3 - Core Target */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md">
                    Grade 3 • Primary Benchmark
                  </span>
                  <span className="text-xs font-extrabold text-amber-900">3-PS2-1</span>
                </div>
                <h4 className="text-base font-extrabold text-amber-950 mt-1.5">
                  Plan and conduct an investigation to provide evidence of the effects of balanced and unbalanced forces on the motion of an object.
                </h4>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  <strong>How this sim supports it:</strong> Students observe that when Push equals Static Friction, forces are <em>balanced</em> (Net Force = 0 N) and the box remains still. When Push exceeds maximum static friction, forces become <em>unbalanced</em> (Net Force &gt; 0 N) and the box accelerates!
                </p>
              </div>

              {/* Kindergarten & Grade 1 Pushes and Pulls */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-200 px-2 py-0.5 rounded-md">
                    Kindergarten to Grade 2
                  </span>
                  <span className="text-xs font-extrabold text-sky-900">K-PS2-1 & K-PS2-2</span>
                </div>
                <h4 className="text-base font-extrabold text-sky-950 mt-1.5">
                  Compare the effects of different strengths or directions of pushes and pulls on an object.
                </h4>
                <p className="text-xs text-sky-900 mt-1 leading-relaxed">
                  <strong>How this sim supports it:</strong> Elementary students test different push forces (gentle tap vs big turbo push) and test how changing from slick ice to sticky rubber changes how hard they have to push to start motion.
                </p>
              </div>

              {/* Grade 5 Earth Gravity & Downward Force */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-200 px-2 py-0.5 rounded-md">
                    Grade 5
                  </span>
                  <span className="text-xs font-extrabold text-purple-900">5-PS2-1</span>
                </div>
                <h4 className="text-base font-extrabold text-purple-950 mt-1.5">
                  Support an argument that gravitational force exerted by Earth on objects is directed downward.
                </h4>
                <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                  <strong>How this sim supports it:</strong> By toggling vertical force vectors, students see how the downward gravity vector ($F_g$) increases with heavier objects (from 5 kg to 200 kg), causing the floor to push upward harder ($F_N$), which increases friction!
                </p>
              </div>

              {/* Middle School (MS-PS2-2) */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md">
                    Middle School (Grades 6–8)
                  </span>
                  <span className="text-xs font-extrabold text-emerald-900">MS-PS2-2</span>
                </div>
                <h4 className="text-base font-extrabold text-emerald-950 mt-1.5">
                  Plan an investigation to provide evidence that the change in an object's motion depends on the sum of the forces (net force) and the mass of the object.
                </h4>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  <strong>How this sim supports it:</strong> Students examine the Net Force readout and see Newton's 2nd Law (a = F_net / m) in direct action when comparing how fast the 5 kg gift box accelerates compared to the 100 kg steel safe under the same push force.
                </p>
              </div>

              {/* Middle School (MS-PS2-1) - Newton's Third Law */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border-2 border-orange-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-800 bg-orange-200 px-2 py-0.5 rounded-md">
                    Middle School (Grades 6–8)
                  </span>
                  <span className="text-xs font-extrabold text-orange-900">MS-PS2-1</span>
                </div>
                <h4 className="text-base font-extrabold text-orange-950 mt-1.5">
                  Apply Newton's Third Law: For every force, there is an equal and opposite reaction force.
                </h4>
                <p className="text-xs text-orange-900 mt-1 leading-relaxed">
                  <strong>How this sim supports it:</strong> By toggling Action-Reaction Pairs, students see that when the person pushes the box forward, the box simultaneously pushes backward on the person's hands with equal force. Similarly, while the floor resists the box with friction, the box drags forward on the floor!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <h5 className="font-extrabold text-indigo-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  The Mystery of the Matching Force Arrow
                </h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Select the <strong>Wooden Crate (20 kg)</strong> on <strong>Classroom Carpet</strong>. Push with 30 N. Then 60 N. Then 90 N. Look closely at the red friction arrow. What do you notice about its size? Why doesn't the crate move even though you are pushing hard?
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <h5 className="font-extrabold text-indigo-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  The "Breakaway Snap!"
                </h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Gradually increase the push force on the crate until it starts sliding. What exact force was needed to break free? The instant it starts sliding, what happens to the red friction force? Does it get larger or smaller? Why is it easier to keep pushing something than it was to start it?
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <h5 className="font-extrabold text-indigo-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Surface Showdown
                </h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Keep the mass set to the <strong>20 kg Wooden Crate</strong>. Test all 5 surfaces: Ice Rink, Gym Wood, Carpet, Sidewalk, and Sticky Rubber. Record the minimum force required to break static friction on each one. Rank the surfaces from slickest to grippiest!
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <h5 className="font-extrabold text-indigo-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  Mass & Friction Connection
                </h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  On the <strong>Gym Wood Floor</strong>, compare the <strong>5 kg Gift Box</strong> with the <strong>100 kg Bank Safe</strong>. Which one has more friction? Look at the vertical arrows (Gravity and Normal force). How does weight change the grip between surfaces?
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rubric' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-black text-blue-900 uppercase">Static Friction</div>
                  <div className="text-sm font-extrabold text-blue-950 mt-0.5">The "Sticking" Force</div>
                  <p className="text-xs text-blue-800 mt-1">
                    Friction between two surfaces that are <strong>not moving</strong> relative to each other. It increases to match any push force until it hits its maximum breakaway limit!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-xs font-black text-amber-900 uppercase">Kinetic Friction</div>
                  <div className="text-sm font-extrabold text-amber-950 mt-0.5">The "Sliding" Force</div>
                  <p className="text-xs text-amber-800 mt-1">
                    Friction between surfaces that are <strong>already sliding</strong> past each other. It is almost always <em>smaller</em> than maximum static friction!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-black text-emerald-900 uppercase">Balanced Forces</div>
                  <div className="text-sm font-extrabold text-emerald-950 mt-0.5">Net Force = 0 N</div>
                  <p className="text-xs text-emerald-800 mt-1">
                    When all forces cancel each other out. If an object is resting, it stays resting. If it is already moving, its speed does not change!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-xs font-black text-purple-900 uppercase">Unbalanced Forces</div>
                  <div className="text-sm font-extrabold text-purple-950 mt-0.5">Net Force &gt; 0 N</div>
                  <p className="text-xs text-purple-800 mt-1">
                    When one force is larger than the opposing forces. This causes the object to speed up (accelerate) or slow down (decelerate)!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 md:col-span-2">
                  <div className="text-xs font-black text-orange-900 uppercase">Action-Reaction Pairs (Newton's 3rd Law)</div>
                  <div className="text-sm font-extrabold text-orange-950 mt-0.5">Equal & Opposite Partner Forces</div>
                  <p className="text-xs text-orange-800 mt-1">
                    Forces always come in matched pairs! When you push against a box, the box pushes back against your palms with the exact same number of Newtons. When the floor resists the box with friction, the box pulls forward on the floor.
                  </p>
                </div>
              </div>

              {/* Elementary Science Quote */}
              <div className="p-3.5 bg-slate-100 rounded-2xl text-center text-xs font-medium text-slate-600">
                ⭐ <em>"Science is about testing, observing, and predicting! Have students test different predictions in the simulator."</em>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Built aligned with K-8 NGSS Physical Science Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition"
          >
            Got it, Let's Experiment!
          </button>
        </div>
      </div>
    </div>
  );
};
