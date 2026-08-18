// Minder workspace style: restrained dark surfaces, warm orange actions, and direct recovery guidance.
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#171717] px-6 text-[#f2f2ee]">
      <section className="max-w-md text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#dc744d]">
          Error 404
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">This page does not exist.</h1>
        <p className="mt-4 text-base leading-7 text-[#b8b8b0]">
          The address may be incorrect, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#dc744d] px-5 py-3 text-sm font-semibold text-[#171717]"
        >
          Return to Minder
        </Link>
      </section>
    </main>
  );
}
