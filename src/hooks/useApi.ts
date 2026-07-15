import { trpc } from "@/providers/trpc";
import { useCallback } from "react";

// Workers
export function useWorkers() {
  return trpc.worker.list.useQuery();
}

export function useWorkerLogin() {
  const utils = trpc.useUtils();
  return trpc.worker.login.useMutation({
    onSuccess: () => {
      utils.worker.list.invalidate();
    },
  });
}

export function useWorkerLogout() {
  const utils = trpc.useUtils();
  return trpc.worker.logout.useMutation({
    onSuccess: () => {
      utils.worker.list.invalidate();
    },
  });
}

export function useToggleWorkerLive() {
  const utils = trpc.useUtils();
  return trpc.worker.toggleLive.useMutation({
    onSuccess: () => {
      utils.worker.list.invalidate();
    },
  });
}

export function useUpdateWorkerProfile() {
  const utils = trpc.useUtils();
  return trpc.worker.updateProfile.useMutation({
    onSuccess: () => {
      utils.worker.list.invalidate();
    },
  });
}

export function useAddWorker() {
  const utils = trpc.useUtils();
  return trpc.worker.add.useMutation({
    onSuccess: () => {
      utils.worker.list.invalidate();
    },
  });
}

export function useRemoveWorker() {
  const utils = trpc.useUtils();
  return trpc.worker.remove.useMutation({
    onSuccess: () => {
      utils.worker.list.invalidate();
    },
  });
}

// Content
export function useSiteContent() {
  return trpc.content.getAll.useQuery();
}

export function useUpdateContent() {
  const utils = trpc.useUtils();
  return trpc.content.update.useMutation({
    onSuccess: () => {
      utils.content.getAll.invalidate();
    },
  });
}

// Announcements
export function useAnnouncements() {
  return trpc.content.listAnnouncements.useQuery();
}

export function useAddAnnouncement() {
  const utils = trpc.useUtils();
  return trpc.content.addAnnouncement.useMutation({
    onSuccess: () => {
      utils.content.listAnnouncements.invalidate();
    },
  });
}

export function useToggleAnnouncement() {
  const utils = trpc.useUtils();
  return trpc.content.toggleAnnouncement.useMutation({
    onSuccess: () => {
      utils.content.listAnnouncements.invalidate();
    },
  });
}

export function useRemoveAnnouncement() {
  const utils = trpc.useUtils();
  return trpc.content.removeAnnouncement.useMutation({
    onSuccess: () => {
      utils.content.listAnnouncements.invalidate();
    },
  });
}

// Files
export function useFiles() {
  return trpc.content.listFiles.useQuery();
}

export function useAddFile() {
  const utils = trpc.useUtils();
  return trpc.content.addFile.useMutation({
    onSuccess: () => {
      utils.content.listFiles.invalidate();
    },
  });
}

export function useRemoveFile() {
  const utils = trpc.useUtils();
  return trpc.content.removeFile.useMutation({
    onSuccess: () => {
      utils.content.listFiles.invalidate();
    },
  });
}

// Appointments
export function useAppointments() {
  return trpc.appointment.list.useQuery();
}

export function useAppointmentsByWorker(workerId: number) {
  return trpc.appointment.listByWorker.useQuery({ workerId });
}

export function useAddAppointment() {
  const utils = trpc.useUtils();
  return trpc.appointment.add.useMutation({
    onSuccess: () => {
      utils.appointment.list.invalidate();
    },
  });
}

// Session verification (restore login on page refresh)
export function useVerifyToken(token: string | null) {
  return trpc.user.verifyToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );
}

export function useUserLogout() {
  return trpc.user.logout.useMutation();
}

// Check real online status based on active login sessions
export function useWorkerSessions() {
  return trpc.worker.checkSessions.useQuery(undefined, {
    refetchInterval: 10000, // Poll every 10 seconds to keep status fresh
  });
}

// User accounts (visitors)
export function useUserRegister() {
  return trpc.user.register.useMutation();
}

export function useUserLogin() {
  return trpc.user.login.useMutation();
}

export function useGoogleLogin() {
  return trpc.user.googleLogin.useMutation();
}

// Get Google Client ID from env
export function getGoogleClientId(): string | null {
  // @ts-ignore — Vite env
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
}

// Visitor presence
export function useVisitorCount() {
  return trpc.visitor.onlineCount.useQuery();
}

export function useRegisterVisitor() {
  return trpc.visitor.register.useMutation();
}

export function useHeartbeat() {
  return trpc.visitor.heartbeat.useMutation();
}

export function useDisconnectVisitor() {
  return trpc.visitor.disconnect.useMutation();
}

export function useJoinRoom() {
  return trpc.visitor.joinRoom.useMutation();
}

export function useUpdateVisitorName() {
  return trpc.visitor.updateName.useMutation();
}

// SSE for real-time updates
export function useRealtime(onUpdate: (data: { type: string; count?: number }) => void) {
  const connect = useCallback(() => {
    const eventSource = new EventSource("/api/trpc/worker.subscribe");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch {
        // ignore
      }
    };
    return () => eventSource.close();
  }, [onUpdate]);

  return { connect };
}
