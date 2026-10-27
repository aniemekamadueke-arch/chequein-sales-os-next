import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="eyebrow">404</div>
      <h1 className="serif mt-1 text-[38px]">That page isn’t in the playbook.</h1>
      <p className="mt-2 max-w-[420px] text-[13px] text-muted">
        The link may be old. Everything lives in Today, Pipeline, Compliance, Playbook and Numbers.
      </p>
      <Link href="/" className="mt-4 rounded-lg bg-brand px-3.5 py-2 text-[12px] font-semibold text-white">
        Back to Today
      </Link>
    </div>
  );
}
