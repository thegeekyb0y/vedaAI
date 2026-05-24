import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AssignmentStatus, IGeneratedPaper } from "@/types/assignment.types";

interface JobSocketState {
  status: AssignmentStatus;
  result: IGeneratedPaper | null;
}

export const useJobSocket = (
  assignmentId: string,
  initialStatus: AssignmentStatus,
): JobSocketState => {
  const [status, setStatus] = useState<AssignmentStatus>(initialStatus);
  const [result, setResult] = useState<IGeneratedPaper | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    socket.emit("join", assignmentId);

    socket.on(
      "job:status",
      (data: { status: AssignmentStatus; result?: IGeneratedPaper }) => {
        setStatus(data.status);
        if (data.result) setResult(data.result);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [assignmentId]);

  return { status, result };
};
