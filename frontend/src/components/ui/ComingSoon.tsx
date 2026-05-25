import Link from "next/link";

interface ComingSoonProps {
  title: string;
  message: string;
}

export const ComingSoon = ({ title, message }: ComingSoonProps) => (
  <div className="flex min-h-[70vh] items-center justify-center px-4">
    <div className="w-full max-w-md rounded-[32px] bg-white px-8 py-12 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle text-[28px]">
        🚀
      </div>
      <h1 className="text-[26px] font-bold text-primary">Coming Soon</h1>
      <p className="mt-3 text-[15px] leading-7 text-secondary">{message}</p>
      <Link
        href="/assignments"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#242424]"
      >
        Back to Assignments
      </Link>
    </div>
  </div>
);
