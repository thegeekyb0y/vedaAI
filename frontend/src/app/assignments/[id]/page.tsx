"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { AssignmentPaper } from "@/components/assignments/AssignmentPaper";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  ASSIGNMENT_POLL_INTERVAL,
} from "@/features/assignments/constants";
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
    const nextAssignment = await getAssignmentById(assignmentId);
    setAssignment(nextAssignment);
    setError(null);
    return nextAssignment;
  }, [assignmentId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const nextAssignment = await getAssignmentById(assignmentId);
        if (!isMounted) return;
        setAssignment(nextAssignment);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(getApiErrorMessage(err, "Failed to load assignment"));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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
        const nextAssignment = await fetchAssignment();
        if (isAssignmentActive(nextAssignment.status)) {
          timeoutRef.current = setTimeout(poll, ASSIGNMENT_POLL_INTERVAL);
        }
      } catch {
        timeoutRef.current = setTimeout(poll, ASSIGNMENT_POLL_INTERVAL);
      }
    };

    timeoutRef.current = setTimeout(poll, ASSIGNMENT_POLL_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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
      const nextAssignment = await regenerateAssignment(assignmentId);
      setAssignment(nextAssignment);
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
      <section className="mx-auto max-w-3xl rounded-[34px] border border-rose-200 bg-white p-8 text-center shadow-(--shadow-card)">
        <h1 className="text-2xl font-semibold text-(--color-primary)">
          Assignment not available
        </h1>
        <p className="mt-4 text-sm leading-7 text-(--color-secondary)">
          {error ?? "We could not find the requested assignment."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => router.push("/assignments")}>
            Back to Assignments
          </Button>
          <Button onClick={() => void handleRetryLoad()}>Try Again</Button>
        </div>
      </section>
    );
  }

  const isActive = isAssignmentActive(assignment.status);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[34px] bg-white p-6 shadow-(--shadow-card) sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-orange)">
              Assignment Status
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-primary) sm:text-4xl">
              {assignment.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-(--color-secondary)">
              {statusText}
            </p>
          </div>

          <div className="print-hidden flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              iconLeft={<RefreshCcw size={15} />}
              loading={regenerating}
              disabled={isActive}
              onClick={handleRegenerate}
            >
              Regenerate
            </Button>
            <Button
              iconLeft={<Download size={15} />}
              disabled={assignment.status !== "done"}
              onClick={() => window.print()}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      </section>

      {isActive ? (
        <section className="rounded-[34px] border border-(--color-border) bg-white p-8 shadow-(--shadow-card) sm:p-10">
          <div className="mx-auto max-w-xl text-center">
            <LoadingSpinner size="lg" />
            <h2 className="mt-6 text-2xl font-semibold text-(--color-primary)">
              Generating your assignment
            </h2>
            <p className="mt-3 text-sm leading-7 text-(--color-secondary)">
              We are polling the existing backend until the generation reaches a final state.
              You can leave this page open and it will refresh automatically.
            </p>
          </div>
        </section>
      ) : null}

      {assignment.status === "failed" ? (
        <section className="rounded-[34px] border border-rose-200 bg-white p-8 shadow-(--shadow-card) sm:p-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-(--color-primary)">
              Generation failed
            </h2>
            <p className="mt-3 text-sm leading-7 text-(--color-secondary)">
              The backend marked this assignment as failed. You can retry generation
              using the existing regenerate endpoint.
            </p>
            <div className="mt-6">
              <Button
                iconLeft={<RefreshCcw size={15} />}
                loading={regenerating}
                onClick={handleRegenerate}
              >
                Try Again
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {assignment.status === "done" && assignment.result ? (
        <AssignmentPaper assignment={assignment} />
      ) : null}
    </div>
  );
}
