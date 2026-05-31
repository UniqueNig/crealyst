/**
 * Generic loading skeleton for every /admin/* page. The sidebar + verify
 * banner come from the parent layout and stay rendered; this fills the
 * content area while server data loads. Individual routes can override
 * with their own loading.tsx if they want something more bespoke.
 */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Page header */}
      <div className="mb-10 flex flex-col gap-3">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-4 w-80 rounded" />
      </div>

      {/* Content blocks — match the height/shape of most dashboard sections. */}
      <div className="flex flex-col gap-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    </div>
  );
}
