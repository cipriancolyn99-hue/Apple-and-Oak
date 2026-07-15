import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User } from 'lucide-react';

interface VoiceCallProps {
  workerName: 'Laura' | 'John';
  onEnd: () => void;
}

type CallState = 'requesting' | 'ringing' | 'connected' | 'denied';

export function VoiceCall({ workerName, onEnd }: VoiceCallProps) {
  const [callState, setCallState] = useState<CallState>('requesting');
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workerColor = workerName === 'Laura' ? 'from-rose-500 to-rose-700' : 'from-sky-500 to-sky-700';

  // Request microphone access on mount
  useEffect(() => {
    let cancelled = false;

    async function startCall() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCallState('ringing');

        // Simulate the worker answering after a few seconds
        setTimeout(() => {
          if (!cancelled) {
            setCallState('connected');
          }
        }, 3500);
      } catch {
        if (!cancelled) {
          setCallState('denied');
        }
      }
    }

    startCall();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Mute/unmute mic
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }, [muted]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    onEnd();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0f1923] to-[#0a1018]">
      {/* Worker avatar */}
      <div className="relative mb-6">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${workerColor} flex items-center justify-center text-white text-4xl font-bold shadow-2xl`}>
          {workerName[0]}
        </div>
        {callState === 'ringing' && (
          <div className="absolute inset-0 rounded-full border-4 border-teal-400 animate-ping" />
        )}
        {callState === 'connected' && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-4 border-[#0f1923] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          </div>
        )}
      </div>

      <h2 className="text-white text-2xl font-bold mb-1">{workerName}</h2>
      <p className="text-white/60 text-sm mb-8">
        {workerName === 'Laura' ? 'Family Counselor' : 'Mental Health Specialist'}
      </p>

      {/* Status */}
      <div className="mb-10 text-center">
        {callState === 'requesting' && (
          <div className="flex items-center gap-2 text-white/70">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Requesting microphone...</span>
          </div>
        )}
        {callState === 'ringing' && (
          <div className="flex items-center gap-2 text-teal-400">
            <Phone className="w-4 h-4 animate-bounce" />
            <span className="animate-pulse">Calling {workerName}...</span>
          </div>
        )}
        {callState === 'connected' && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-lg">{formatDuration(duration)}</span>
          </div>
        )}
        {callState === 'denied' && (
          <div className="text-red-400">
            <p className="font-semibold">Microphone access denied</p>
            <p className="text-white/50 text-sm mt-1">Please allow microphone to make a call</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {callState === 'connected' && (
          <>
            <button
              onClick={() => setMuted(!muted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                muted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setSpeakerOff(!speakerOff)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                speakerOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={speakerOff ? 'Speaker on' : 'Speaker off'}
            >
              {speakerOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </>
        )}

        {/* End call */}
        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-lg"
          title="End call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>

      {callState === 'connected' && (
        <p className="text-white/40 text-xs mt-8 flex items-center gap-2">
          <User className="w-3 h-3" />
          You are in a private voice call with {workerName}
        </p>
      )}
    </div>
  );
}
