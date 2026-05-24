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
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
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
    const load = async () => {
      try {
        const data = await getAssignments();
        if (!isMounted) return;
        setAssignments(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(getApiErrorMessage(err, "Failed to load assignments"));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assignments;
    return assignments.filter((a) => a.title.toLowerCase().includes(query));
  }, [assignments, search]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments((curr) => curr.filter((item) => item._id !== id));
      toast.success("Assignment deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete assignment"));
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const next = await regenerateAssignment(id);
      setAssignments((curr) =>
        curr.map((item) => (item._id === id ? next : item)),
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
    <div className="mx-auto max-w-[1320px] space-y-5 pb-28">
      {/* Page header */}
      <div className="flex items-start gap-3 px-1">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary">Assignments</h1>
          <p className="mt-0.5 text-sm text-secondary">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* Filter + Search bar */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          className="rounded-full"
          iconLeft={<SlidersHorizontal size={15} />}
        >
          Filter By
        </Button>

        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Assignment"
            className="h-10 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm text-primary outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {/* Cards grid */}
      {filteredAssignments.length === 0 ? (
        <section className="rounded-[24px] border border-border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-primary">
            No assignments match your search
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Try a different keyword or clear the search.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* Floating create button — bottom center */}
      <div className="print-hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => router.push("/assignments/create")}
          className="flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-colors hover:bg-black"
        >
          <Plus size={16} />
          Create Assignment
        </button>
      </div>
    </div>
  );
}
