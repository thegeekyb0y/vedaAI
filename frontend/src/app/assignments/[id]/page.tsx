"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { AssignmentPaper } from "@/components/assignments/AssignmentPaper";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ASSIGNMENT_POLL_INTERVAL } from "@/features/assignments/constants";
import {
  getAssignmentById,
  regenerateAssignment,
} from "@/features/assignments/api";
import { isAssignmentActive } from "@/features/assignments/utils";
import { getApiErrorMessage } from "@/lib/api";
import { IAssignment } from "@/types/assignment.types";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [assignment, setAssignment] = useState<IAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const assignmentId = params.id;

  const fetchAssignment = useCallback(async () => {
    const next = await getAssignmentById(assignmentId);
    setAssignment(next);
    setError(null);
    return next;
  }, [assignmentId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const next = await getAssignmentById(assignmentId);
        if (!isMounted) return;
        setAssignment(next);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(getApiErrorMessage(err, "Failed to load assignment"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [assignmentId]);

  useEffect(() => {
    if (!assignment || !isAssignmentActive(assignment.status)) return;

    const poll = async () => {
      try {
        const next = await fetchAssignment();
        if (isAssignmentActive(next.status)) {
          timeoutRef.current = setTimeout(poll, ASSIGNMENT_POLL_INTERVAL);
        }
      } catch {
        timeoutRef.current = setTimeout(poll, ASSIGNMENT_POLL_INTERVAL);
      }
    };

    timeoutRef.current = setTimeout(poll, ASSIGNMENT_POLL_INTERVAL);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [assignment, fetchAssignment]);

  const statusText = useMemo(() => {
    switch (assignment?.status) {
      case "pending":
        return "Assignment queued. We are preparing your generation job.";
      case "processing":
        return "Generation is in progress. This page will update automatically.";
      case "failed":
        return "Generation failed. You can retry without leaving this page.";
      case "done":
        return "Your generated paper is ready for review and print.";
      default:
        return "Loading assignment details.";
    }
  }, [assignment?.status]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const next = await regenerateAssignment(assignmentId);
      setAssignment(next);
      toast.success("Assignment queued for regeneration");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to regenerate assignment"));
    } finally {
      setRegenerating(false);
    }
  };

  const handleRetryLoad = async () => {
    setLoading(true);
    try {
      await fetchAssignment();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load assignment"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner label="Loading assignment" size="lg" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <section className="mx-auto max-w-3xl rounded-[34px] border border-rose-200 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold text-primary">
          Assignment not available
        </h1>
        <p className="mt-4 text-sm leading-7 text-secondary">
          {error ?? "We could not find the requested assignment."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => router.push("/assignments")}
          >
            Back to Assignments
          </Button>
          <Button onClick={() => void handleRetryLoad()}>Try Again</Button>
        </div>
      </section>
    );
  }

  const isActive = isAssignmentActive(assignment.status);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      {/* Status bar — always visible on screen, hidden on print */}
      <section className="print:hidden rounded-[28px] bg-white px-6 py-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[15px] font-medium text-secondary">{statusText}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              iconLeft={<RefreshCcw size={15} />}
              loading={regenerating}
              disabled={isActive}
              onClick={() => void handleRegenerate()}
            >
              Regenerate
            </Button>
          </div>
        </div>
      </section>

      {/* Generating state */}
      {isActive && (
        <section className="rounded-[34px] border border-border bg-white p-8 shadow-[var(--shadow-card)] sm:p-10">
          <div className="mx-auto max-w-xl text-center">
            <LoadingSpinner size="lg" />
            <h2 className="mt-6 text-2xl font-semibold text-primary">
              Generating your assignment
            </h2>
            <p className="mt-3 text-sm leading-7 text-secondary">
              Sit tight — this page will refresh automatically once your paper
              is ready.
            </p>
          </div>
        </section>
      )}

      {/* Failed state */}
      {assignment.status === "failed" && (
        <section className="rounded-[34px] border border-rose-200 bg-white p-8 shadow-[var(--shadow-card)] sm:p-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-primary">
              Generation failed
            </h2>
            <p className="mt-3 text-sm leading-7 text-secondary">
              Something went wrong during generation. You can retry below.
            </p>
            <div className="mt-6">
              <Button
                iconLeft={<RefreshCcw size={15} />}
                loading={regenerating}
                onClick={() => void handleRegenerate()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Paper */}
      {assignment.status === "done" && assignment.result && (
        <AssignmentPaper assignment={assignment} />
      )}
    </div>
  );
}
