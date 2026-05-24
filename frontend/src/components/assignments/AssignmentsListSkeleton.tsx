export const AssignmentsListSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-[30px] border border-(--color-border) bg-white p-5 shadow-(--shadow-card)"
      >
        <div className="h-6 w-28 rounded-full bg-(--color-surface-subtle)" />
        <div className="mt-5 h-7 w-2/3 rounded-full bg-(--color-surface-subtle)" />
        <div className="mt-3 h-4 w-1/2 rounded-full bg-(--color-surface-subtle)" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-[24px] bg-(--color-surface-subtle)" />
          <div className="h-20 rounded-[24px] bg-(--color-surface-subtle)" />
        </div>
      </div>
    ))}
  </div>
);
