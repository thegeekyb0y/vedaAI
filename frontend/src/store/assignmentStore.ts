import { create } from "zustand";
import { IAssignment } from "@/types/assignment.types";

interface AssignmentStore {
  assignments: IAssignment[];
  setAssignments: (assignments: IAssignment[]) => void;
  upsertAssignment: (assignment: IAssignment) => void;
  removeAssignment: (id: string) => void;
  updateAssignmentStatus: (id: string, updates: Partial<IAssignment>) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],

  setAssignments: (assignments) => set({ assignments }),

  upsertAssignment: (assignment) =>
    set((state) => {
      const exists = state.assignments.some((a) => a._id === assignment._id);
      if (exists) {
        return {
          assignments: state.assignments.map((a) =>
            a._id === assignment._id ? assignment : a,
          ),
        };
      }
      return { assignments: [assignment, ...state.assignments] };
    }),

  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
    })),

  updateAssignmentStatus: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, ...updates } : a,
      ),
    })),
}));
