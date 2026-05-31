export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-32">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="mt-8 skeleton h-4 w-40 rounded" />
      <div className="mt-4 skeleton h-12 w-3/4 rounded" />
      <div className="mt-3 skeleton h-12 w-1/2 rounded" />
      <div className="mt-6 skeleton h-6 w-2/3 rounded" />
      <div className="mt-12 skeleton aspect-[16/9] w-full rounded-3xl" />
    </div>
  );
}
