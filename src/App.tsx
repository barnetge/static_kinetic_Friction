import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Surface,
  PushObject,
  VectorDisplayOptions,
  SimState,
  SURFACES,
  PUSH_OBJECTS,
} from './types/physics';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { VectorControls } from './components/VectorControls';
import { NGSSModal } from './components/NGSSModal';
import { ChallengesModal, Challenge } from './components/ChallengesModal';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import { BookOpen, Trophy, Sparkles, HelpCircle, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  // 1. Surface and Mass Selection
  const [currentSurface, setCurrentSurface] = useState<Surface>(SURFACES[2]); // Default: Classroom Carpet (μ = 0.55)
  const [isCustomFriction, setIsCustomFriction] = useState<boolean>(false);
  const [customStaticMu, setCustomStaticMu] = useState<number>(0.55);
  const [customKineticMu, setCustomKineticMu] = useState<number>(0.38);

  const [currentObject, setCurrentObject] = useState<PushObject>(PUSH_OBJECTS[4]); // Default: 200 kg Concert Piano
  const [isCustomMass, setIsCustomMass] = useState<boolean>(false);
  const [customMass, setCustomMass] = useState<number>(200);
  const [showObject, setShowObject] = useState<boolean>(true);

  // Track Distance (100m to 5000m, default 100m)
  const [trackLength, setTrackLength] = useState<number>(100);

  // 2. Push Force Control
  const [pushForce, setPushForce] = useState<number>(0);

  // 3. Vector Display Options
  const [vectorOptions, setVectorOptions] = useState<VectorDisplayOptions>({
    showAppliedForce: true,
    showFriction: true,
    showNetForce: true,
    showVerticalForces: true,
    showActionReaction: false,
    showValues: true,
    showKidLabels: true,
  });

  // 4. Modals State
  const [isNGSSOpen, setIsNGSSOpen] = useState<boolean>(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  // 5. Simulation Execution State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // 1.0 or 0.5
  const [position, setPosition] = useState<number>(0); // 0 to 12 meters
  const [velocity, setVelocity] = useState<number>(0);
  const [acceleration, setAcceleration] = useState<number>(0);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // Sound and animation timer refs
  const lastTimeRef = useRef<number>(performance.now());
  const soundCooldownRef = useRef<number>(0);

  // 6. Classroom Challenges / Missions
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'balanced-forces',
      title: 'The Sticky Stand-off (Balanced Forces)',
      category: 'Static Friction',
      description: 'Push with at least 50 N while the box stays completely still (Net Force = 0 N). Static friction will match you!',
      badgeEmoji: '🔒',
      completed: false,
    },
    {
      id: 'breakaway-carpet',
      title: 'The Breakaway Snap!',
      category: 'Breakaway',
      description: 'Push hard enough on the Classroom Carpet to break static friction and start sliding!',
      badgeEmoji: '💥',
      completed: false,
    },
    {
      id: 'steady-glide',
      title: 'Smooth Glider (Balanced Motion)',
      category: 'Kinetic Friction',
      description: 'Get the box moving, then adjust your push so Net Force is nearly 0 N. Watch it glide at a steady speed!',
      badgeEmoji: '🏄‍♂️',
      completed: false,
    },
    {
      id: 'heavy-safe',
      title: 'Heavyweight Champion',
      category: 'Mass & Friction',
      description: 'Select the 100 kg Bank Safe or 200 kg Concert Piano and break its massive static friction!',
      badgeEmoji: '🎹',
      completed: false,
    },
  ]);

  // Derived physics parameters
  const mass = isCustomMass ? customMass : currentObject.mass;
  const staticMu = isCustomFriction ? customStaticMu : currentSurface.staticMu;
  const kineticMu = isCustomFriction ? customKineticMu : currentSurface.kineticMu;

  const g = 9.8; // m/s²
  const normalForce = mass * g;
  const gravityForce = mass * g;
  const maxStaticFriction = staticMu * normalForce;
  const kineticFriction = kineticMu * normalForce;

  // Live friction and net force calculations
  let currentFriction = 0;
  let netForce = 0;

  if (!isMoving) {
    if (pushForce <= maxStaticFriction) {
      // Locked at rest by static friction
      currentFriction = pushForce;
      netForce = 0;
    } else {
      // Transitioning to motion
      currentFriction = kineticFriction;
      netForce = pushForce - kineticFriction;
    }
  } else {
    // Currently moving
    currentFriction = kineticFriction;
    netForce = pushForce - kineticFriction;
  }

  // Combined Sim State object passed to components
  const simState: SimState = {
    pushForce,
    position,
    velocity,
    acceleration,
    isMoving,
    justBrokeFree: false,
    normalForce,
    gravityForce,
    maxStaticFriction,
    kineticFriction,
    currentFriction,
    netForce,
  };

  // Check challenges completion
  const checkMissions = useCallback(
    (currentVel: number, currentPos: number) => {
      setChallenges((prev) =>
        prev.map((ch) => {
          if (ch.completed) return ch;

          if (ch.id === 'balanced-forces') {
            if (pushForce >= 50 && currentVel === 0) {
              sound.playSuccess();
              return { ...ch, completed: true };
            }
          }
          if (ch.id === 'breakaway-carpet') {
            if (currentSurface.id === 'carpet' && currentVel > 0.1) {
              sound.playSuccess();
              return { ...ch, completed: true };
            }
          }
          if (ch.id === 'steady-glide') {
            if (currentVel > 0.8 && Math.abs(netForce) < 4) {
              sound.playSuccess();
              return { ...ch, completed: true };
            }
          }
          if (ch.id === 'heavy-safe') {
            if (mass >= 100 && currentVel > 0.2) {
              sound.playSuccess();
              confetti({ particleCount: 60, spread: 60 });
              return { ...ch, completed: true };
            }
          }
          return ch;
        })
      );
    },
    [pushForce, currentSurface.id, netForce, mass]
  );

  // Main Physics Simulation Loop
  useEffect(() => {
    let animationFrameId: number;

    const tick = (now: number) => {
      const deltaSec = Math.min(0.05, (now - lastTimeRef.current) / 1000) * simSpeed;
      lastTimeRef.current = now;

      if (!isPaused) {
        if (!isMoving) {
          if (pushForce > maxStaticFriction) {
            // SNAP! Break static friction!
            setIsMoving(true);
            sound.playBreakaway();
            confetti({
              particleCount: 25,
              spread: 40,
              origin: { y: 0.7 },
            });
            const startingAccel = (pushForce - kineticFriction) / mass;
            const newVel = startingAccel * deltaSec;
            setAcceleration(startingAccel);
            setVelocity(newVel);
            setPosition((prev) => Math.min(trackLength, prev + newVel * deltaSec));
          } else {
            // Remaining at rest
            setAcceleration(0);
            setVelocity(0);
          }
        } else {
          // Object is in motion (Kinetic friction regime)
          const currentAccel = (pushForce - kineticFriction) / mass;
          const nextVel = velocity + currentAccel * deltaSec;

          if (nextVel <= 0) {
            // Box came to a stop
            setVelocity(0);
            setAcceleration(0);
            setIsMoving(false);
          } else {
            // Box continues moving
            setVelocity(nextVel);
            setAcceleration(currentAccel);
            setPosition((prev) => {
              const nextPos = prev + nextVel * deltaSec;
              if (nextPos >= trackLength) {
                // Reached end of track
                return trackLength;
              }
              return nextPos;
            });
          }

          checkMissions(nextVel, position);
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isPaused,
    isMoving,
    pushForce,
    maxStaticFriction,
    kineticFriction,
    mass,
    velocity,
    simSpeed,
    position,
    trackLength,
    checkMissions,
  ]);

  // Audio Toggle
  const handleToggleAudio = () => {
    const nextAudio = !isAudioEnabled;
    setIsAudioEnabled(nextAudio);
    sound.enabled = nextAudio;
  };

  // Reset Box Position
  const handleResetPosition = () => {
    sound.playClick();
    setPosition(0);
    setVelocity(0);
    setAcceleration(0);
    setIsMoving(false);
  };

  // Track Length Handler
  const handleChangeTrackLength = (newDist: number) => {
    sound.playClick();
    setTrackLength(newDist);
    if (position > newDist) {
      setPosition(newDist);
    }
  };

  // Reset Everything to Default
  const handleResetAll = () => {
    sound.playClick();
    setPushForce(0);
    setPosition(0);
    setVelocity(0);
    setAcceleration(0);
    setIsMoving(false);
    setTrackLength(100); // Default track distance 100m
    setCurrentSurface(SURFACES[2]); // Classroom Carpet (μ = 0.55)
    setIsCustomFriction(false);
    setCustomStaticMu(0.55);
    setCustomKineticMu(0.38);
    setCurrentObject(PUSH_OBJECTS[4]); // Concert Piano (200 kg)
    setIsCustomMass(false);
    setCustomMass(200);
    setShowObject(true);
    setIsPaused(false);
    setSimSpeed(1.0);
    setVectorOptions({
      showAppliedForce: true,
      showFriction: true,
      showNetForce: true,
      showVerticalForces: true,
      showActionReaction: false,
      showValues: true,
      showKidLabels: true,
    });
  };

  // Quick challenge mission auto-setup
  const handleSelectChallengeSetup = (challengeId: string) => {
    handleResetPosition();
    if (challengeId === 'balanced-forces') {
      setCurrentSurface(SURFACES[2]);
      setCurrentObject(PUSH_OBJECTS[1]);
      setPushForce(30);
    } else if (challengeId === 'breakaway-carpet') {
      setCurrentSurface(SURFACES[2]);
      setCurrentObject(PUSH_OBJECTS[1]);
      setPushForce(100);
    } else if (challengeId === 'steady-glide') {
      setCurrentSurface(SURFACES[1]);
      setCurrentObject(PUSH_OBJECTS[1]);
      setPushForce(60);
    } else if (challengeId === 'heavy-safe') {
      setCurrentSurface(SURFACES[0]);
      setCurrentObject(PUSH_OBJECTS[3]);
      setPushForce(120);
    }
  };

  const handleUpdateFrictionFromSlider = (val: number) => {
    setIsCustomFriction(true);
    setCustomStaticMu(val);
    setCustomKineticMu(Number((val * 0.72).toFixed(2)));
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 pb-12">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Kid Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Physics Lab K–8
                </span>
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                  Interactive Simulation
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mt-0.5">
                Friction Lab: <span className="text-blue-600">Push</span> &{' '}
                <span className="text-emerald-600">Slide!</span>
              </h1>
            </div>
          </div>

          {/* Action Header Buttons: NGSS Standards & Missions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Missions / Quests Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsChallengesOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm border-2 border-amber-300 shadow-xs transition active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Missions</span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center">
                {challenges.filter((c) => c.completed).length}
              </span>
            </button>

            {/* NGSS Frameworks Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsNGSSOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>NGSS K–8 Standards</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* 1. SIMULATION CANVAS VIEW */}
        <SimulationCanvas
          surface={currentSurface}
          object={currentObject}
          simState={simState}
          vectorOptions={vectorOptions}
          onResetPosition={handleResetPosition}
          pushForce={pushForce}
          onChangePushForce={setPushForce}
          surfaceFriction={staticMu}
          onChangeSurfaceFriction={handleUpdateFrictionFromSlider}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          showObject={showObject}
          onToggleShowObject={() => setShowObject(!showObject)}
          showActionReaction={vectorOptions.showActionReaction}
          onToggleActionReaction={() =>
            setVectorOptions((prev) => ({
              ...prev,
              showActionReaction: !prev.showActionReaction,
            }))
          }
          availableObjects={PUSH_OBJECTS}
          onSelectObject={setCurrentObject}
          onResetAll={handleResetAll}
          trackLength={trackLength}
          onChangeTrackLength={handleChangeTrackLength}
        />

        {/* 2. VECTOR TOGGLE CONTROLS BAR */}
        <VectorControls
          options={vectorOptions}
          onChangeOptions={setVectorOptions}
        />

        {/* 3. CONTROLS: PUSH FORCE, MASS, AND FLOOR SURFACE */}
        <ControlPanel
          currentSurface={currentSurface}
          onSelectSurface={setCurrentSurface}
          customStaticMu={customStaticMu}
          customKineticMu={customKineticMu}
          isCustomFriction={isCustomFriction}
          onUpdateCustomFriction={(sMu, kMu) => {
            setCustomStaticMu(sMu);
            setCustomKineticMu(kMu);
          }}
          onToggleCustomFriction={setIsCustomFriction}
          currentObject={currentObject}
          onSelectObject={setCurrentObject}
          customMass={customMass}
          isCustomMass={isCustomMass}
          onUpdateCustomMass={setCustomMass}
          onToggleCustomMass={setIsCustomMass}
          pushForce={pushForce}
          onChangePushForce={setPushForce}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          simSpeed={simSpeed}
          onChangeSimSpeed={setSimSpeed}
          onResetAll={handleResetAll}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={handleToggleAudio}
        />

        {/* Elementary Classroom Quick Activity Prompts */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Try These 3 Fun Experiments in Class:
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs">
              <div className="font-extrabold text-sky-900 mb-1">
                🧪 1. The Ice Slide Test
              </div>
              <p className="text-sky-800 leading-snug">
                Switch floor to <strong>Slick Ice</strong>. Give a quick push of 100 N, then immediately click "Let Go (0 N)". Why does the box keep sliding across ice for so long?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <div className="font-extrabold text-amber-900 mb-1">
                🧪 2. Watch the Friction Drop
              </div>
              <p className="text-amber-800 leading-snug">
                Put the <strong>Bank Safe (100 kg)</strong> on <strong>Carpet</strong>. Slowly raise push until it breaks free. Look at the red friction arrow jump from high to lower!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="font-extrabold text-emerald-900 mb-1">
                🧪 3. The Balanced Speed Trick
              </div>
              <p className="text-emerald-800 leading-snug">
                Once the crate is moving on <strong>Gym Wood</strong>, adjust push force to match kinetic friction. What happens to Net Force and speed? It glides at constant speed!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* NGSS Frameworks Modal */}
      <NGSSModal isOpen={isNGSSOpen} onClose={() => setIsNGSSOpen(false)} />

      {/* Classroom Challenges Modal */}
      <ChallengesModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
        challenges={challenges}
        onSelectChallengeSetup={handleSelectChallengeSetup}
      />
    </div>
  );
}
