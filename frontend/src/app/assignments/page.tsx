"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { getAssignments, deleteAssignment } from "@/lib/api";
import { IAssignment } from "@/types/assignment.types";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/assignments/EmptyState";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [filtered, setFiltered] = useState<IAssignment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const data = await getAssignments();
      setAssignments(data);
      setFiltered(data);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(assignments.filter((a) => a.title.toLowerCase().includes(q)));
  }, [search, assignments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
      toast.success("Assignment deleted");
      fetchAssignments();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-6 h-6 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      {assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <h1 className="text-base font-semibold text-[#111111]">
                Assignments
              </h1>
            </div>
            <p className="text-xs text-[#9CA3AF] ml-4">
              Manage and create assignments for your classes.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-5">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#6B6B6B] hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={13} />
              Filter By
            </button>
            <div className="flex-1 relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-lg text-xs text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-[#111111] transition-colors"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onDelete={handleDelete}
                onView={(id) => router.push(`/assignments/${id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Create Button */}
      {assignments.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-[calc(220px+50%)]">
          <button
            onClick={() => router.push("/assignments/create")}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg hover:bg-[#333] transition-colors"
          >
            <Plus size={15} />
            Create Assignment
          </button>
        </div>
      )}
    </div>
  );
}
