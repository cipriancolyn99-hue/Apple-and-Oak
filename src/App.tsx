import { useEffect, useRef } from "react";
import { useStore } from "@/hooks/useStore";
import { useVisitorCount, useRegisterVisitor, useHeartbeat, useDisconnectVisitor, useVerifyToken } from "@/hooks/useApi";
import { getAuthToken } from "@/providers/trpc";
import { Desktop } from "@/components/Desktop";
import { Taskbar } from "@/components/Taskbar";
import { LoginModal } from "@/components/LoginModal";
import { Window } from "@/components/Window";
import { HomeWindow } from "@/components/HomeWindow";
import { ChatWindow } from "@/components/ChatWindow";
import { BookingWindow } from "@/components/BookingWindow";
import { SocialWorkerWindow } from "@/components/SocialWorkerWindow";
import { AdminPanel } from "@/components/AdminPanel";
import { VoiceCall } from "@/components/VoiceCall";
import "./App.css";

// Global audio
const audio = new Audio("/assets/forest-sound.mp3");
audio.loop = true;
audio.volume = 0.4;

function App() {
  const { windows, soundEnabled, updateTime, sessionId, setUsersOnline, currentUser, setUser, setVisitorAccount, closeWindow } = useStore();
  const { data: visitorCount } = useVisitorCount();
  const registerVisitor = useRegisterVisitor();
  const heartbeat = useHeartbeat();
  const disconnectVisitor = useDisconnectVisitor();
  const registered = useRef(false);

  // Restore login session from stored token on page load
  const storedToken = getAuthToken();
  const { data: tokenVerify } = useVerifyToken(storedToken);
  const sessionRestored = useRef(false);
  useEffect(() => {
    if (tokenVerify && !sessionRestored.current) {
      sessionRestored.current = true;
      if (tokenVerify.valid && tokenVerify.session) {
        const s = tokenVerify.session;
        if (s.role === "staff") {
          setUser({ name: s.name, email: s.email, role: "Staff" });
        } else {
          setVisitorAccount({ id: s.refId, name: s.name, email: s.email });
        }
      }
    }
  }, [tokenVerify, setUser, setVisitorAccount]);

  // Update store with real visitor count
  useEffect(() => {
    if (visitorCount !== undefined) {
      setUsersOnline(visitorCount);
    }
  }, [visitorCount, setUsersOnline]);

  // Register visitor on mount
  useEffect(() => {
    if (!registered.current) {
      registerVisitor.mutate({ sessionId });
      registered.current = true;
    }
  }, [sessionId]);

  // Heartbeat every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      heartbeat.mutate({ sessionId });
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Disconnect on page unload
  useEffect(() => {
    const handleUnload = () => {
      disconnectVisitor.mutate({ sessionId });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [sessionId]);

  // Clock
  useEffect(() => {
    const i = setInterval(updateTime, 1000);
    return () => clearInterval(i);
  }, [updateTime]);

  // Sound control
  useEffect(() => {
    if (soundEnabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [soundEnabled]);

  // First click to start audio
  useEffect(() => {
    const onClick = () => {
      if (useStore.getState().soundEnabled && audio.paused) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("click", onClick, { once: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Real-time updates via SSE
  useEffect(() => {
    const eventSource = new EventSource("/api/trpc/worker.subscribe");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "visitorsUpdated" && data.count !== undefined) {
          setUsersOnline(data.count);
        }
      } catch {
        // ignore
      }
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative select-none">
      {/* Forest Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/assets/forest-bg.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <Desktop />

      {/* Windows — Staff Panel (admin) is CONFIDENTIAL: only renders when staff is logged in */}
      {windows
        .filter((w) => w.isOpen && !w.isMinimized)
        .filter((w) => w.type !== "admin" || currentUser)
        .map((window) => (
        <Window key={window.id} windowData={window}>
          {window.type === "home" && <HomeWindow />}
          {window.type === "mission" && <HomeWindow section="mission" />}
          {window.type === "howWeHelp" && <HomeWindow section="howWeHelp" />}
          {window.type === "ourStory" && <HomeWindow section="ourStory" />}
          {window.type === "contact" && <HomeWindow section="contact" />}
          {window.type === "chatMothers" && <ChatWindow room="mothers" />}
          {window.type === "chatFathers" && <ChatWindow room="fathers" />}
          {window.type === "chatPublic" && <ChatWindow room="public" />}
          {window.type === "booking" && <BookingWindow />}
          {window.type === "socialWorker" && (
            <SocialWorkerWindow workerName={window.data?.workerName as "Laura" | "John"} />
          )}
          {window.type === "voiceCall" && (
            <VoiceCall
              workerName={window.data?.workerName as "Laura" | "John"}
              onEnd={() => closeWindow(window.id)}
            />
          )}
          {window.type === "admin" && <AdminPanel />}
        </Window>
      ))}

      <Taskbar />

      {/* Single unified Login button (auto-detects staff vs user) */}
      <div className="absolute top-4 right-4 z-40">
        <LoginModal />
      </div>
    </div>
  );
}

export default App;
