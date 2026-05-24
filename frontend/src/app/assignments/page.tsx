"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
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
    <div className="mx-auto max-w-[1320px] space-y-4 pb-32 lg:pb-28">
      {/* Page header — hidden on mobile (topbar shows "Assignments" already) */}
      <div className="hidden items-start gap-3 px-1 lg:flex">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
        <div>
          <h1 className="text-xl font-semibold text-primary">Assignments</h1>
          <p className="mt-0.5 text-sm text-secondary">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <button className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[13px] font-medium text-secondary shadow-sm lg:px-5 lg:py-2.5 lg:text-[14px]">
          <Filter size={14} strokeWidth={1.8} />
          <span className="hidden lg:inline">Filter By</span>
          <span className="lg:hidden">Filter</span>
        </button>

        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name"
            className="h-10 w-full rounded-full border border-border bg-white pl-10 pr-4 text-[13px] text-primary shadow-sm outline-none transition-colors focus:border-primary lg:h-10 lg:text-sm"
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
        <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
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

      <button
        onClick={() => router.push("/assignments/create")}
        className="print-hidden fixed bottom-[88px] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-transform active:scale-95 lg:hidden"
      >
        <Plus size={22} strokeWidth={2.5} className="text-orange" />
      </button>

      {/* Desktop: pill bottom-center */}
      <div className="print-hidden fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 lg:block">
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
