"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { AssignmentsListSkeleton } from "@/components/assignments/AssignmentsListSkeleton";
import { EmptyState } from "@/components/assignments/EmptyState";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api";
import {
  deleteAssignment,
  getAssignments,
  regenerateAssignment,
} from "@/features/assignments/api";
import { IAssignment } from "@/types/assignment.types";

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await getAssignments();
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load assignments"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialAssignments = async () => {
      try {
        const data = await getAssignments();
        if (!isMounted) return;
        setAssignments(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(getApiErrorMessage(err, "Failed to load assignments"));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadInitialAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return assignments;

    return assignments.filter((assignment) =>
      assignment.title.toLowerCase().includes(query),
    );
  }, [assignments, search]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments((current) => current.filter((item) => item._id !== id));
      toast.success("Assignment deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete assignment"));
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const nextAssignment = await regenerateAssignment(id);
      setAssignments((current) =>
        current.map((item) => (item._id === id ? nextAssignment : item)),
      );
      toast.success("Assignment queued for regeneration");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to regenerate assignment"));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1320px]">
        <AssignmentsListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1320px]">
        <section className="rounded-[32px] border border-rose-200 bg-white p-8 text-center shadow-card">
          <h2 className="text-xl font-semibold text-primary">
            Could not load assignments
          </h2>
          <p className="mt-3 text-sm text-secondary">{error}</p>
          <div className="mt-6">
            <Button
              onClick={() => void loadAssignments()}
              iconLeft={<RefreshCcw size={15} />}
            >
              Try Again
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="mx-auto max-w-[1320px]">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <section className="rounded-[34px] bg-white p-6 shadow-(--shadow-card) sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange">
              Assignment Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              Create, track, and review assignment generation
            </h1>
            <p className="mt-4 text-sm leading-7 text-secondary">
              Manage the full assignment lifecycle from prompt setup to
              generated paper review, with polished states for uploads, retries,
              and final output.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-[26px] border border-border bg-surface-raised p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Total Assignments
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary">
                {assignments.length}
              </p>
            </div>
            <div className="rounded-[26px] border border-border bg-surface-raised p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                Active Jobs
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary">
                {
                  assignments.filter(
                    (assignment) =>
                      assignment.status === "pending" ||
                      assignment.status === "processing",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      <>
        <section className="rounded-[30px] border border-(--color-border) bg-white p-4 shadow-(--shadow-card) sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted)"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments"
                className="h-12 w-full rounded-full border border-(--color-border) bg-(--color-surface-raised) pl-11 pr-4 text-sm text-(--color-primary) outline-none transition-colors focus:border-(--color-primary)"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="rounded-full"
                iconLeft={<SlidersHorizontal size={15} />}
              >
                Filter
              </Button>
              <Button
                variant="secondary"
                className="rounded-full"
                loading={refreshing}
                onClick={() => void loadAssignments(true)}
                iconLeft={<RefreshCcw size={15} />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </section>

        {filteredAssignments.length === 0 ? (
          <section className="rounded-[30px] border border-(--color-border) bg-white p-10 text-center shadow-(--shadow-card)">
            <h2 className="text-xl font-semibold text-(--color-primary)">
              No assignments match your search
            </h2>
            <p className="mt-3 text-sm text-(--color-secondary)">
              Try a different keyword or clear the current search input.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onDelete={handleDelete}
                onRegenerate={handleRegenerate}
                onView={(id) => router.push(`/assignments/${id}`)}
              />
            ))}
          </section>
        )}

        <div className="print-hidden fixed bottom-24 right-4 sm:bottom-8 sm:right-6 lg:right-8">
          <Button
            size="lg"
            onClick={() => router.push("/assignments/create")}
            iconLeft={<Plus size={16} />}
          >
            Create Assignment
          </Button>
        </div>
      </>
    </div>
  );
}
