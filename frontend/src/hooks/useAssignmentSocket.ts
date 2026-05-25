"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAssignmentStore } from "@/store/assignmentStore";
import { IAssignment } from "@/types/assignment.types";

type JobStatusPayload =
  | { status: "pending" | "processing" | "failed" }
  | { status: "done"; result: IAssignment["result"] };

export const useAssignmentSocket = (assignmentId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const updateAssignmentStatus = useAssignmentStore(
    (s) => s.updateAssignmentStatus,
  );

  useEffect(() => {
    if (!assignmentId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", assignmentId);
    });

    socket.on("job:status", (payload: JobStatusPayload) => {
      if (payload.status === "done") {
        updateAssignmentStatus(assignmentId, {
          status: "done",
          result: payload.result,
        });
      } else {
        updateAssignmentStatus(assignmentId, { status: payload.status });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [assignmentId, updateAssignmentStatus]);
};
