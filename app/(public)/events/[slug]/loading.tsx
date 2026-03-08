export default function EventPageSkeleton() {
  return (
    <div className="bg-[#f8f7f3] min-h-screen">
      {/* HERO */}
      <section className="bg-white pt-8 pb-10">
        <div className="max-w-6xl mx-auto px-5">
          {/* TITLE */}
          <div className="mb-4 space-y-3">
            <div className="h-8 w-64 skeleton rounded-md" />
            <div className="h-[2px] w-24 skeleton rounded-full" />
          </div>

          {/* HERO IMAGE */}
          <div className="relative h-[240px] md:h-[280px] rounded-2xl overflow-hidden skeleton" />

          {/* INFO CARD */}
          <div className="relative -mt-16 bg-white rounded-2xl shadow p-5 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto] gap-6">
              {/* LEFT */}
              <div className="space-y-4">
                <div className="h-4 w-40 skeleton rounded" />

                <div className="flex gap-2">
                  <div className="h-14 w-16 skeleton rounded-lg" />
                  <div className="h-14 w-16 skeleton rounded-lg" />
                  <div className="h-14 w-16 skeleton rounded-lg" />
                  <div className="h-14 w-16 skeleton rounded-lg hidden sm:block" />
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-3 items-start lg:items-end">
                <div className="flex gap-2">
                  <div className="h-12 w-12 skeleton rounded-md" />
                  <div className="h-12 w-12 skeleton rounded-md" />
                  <div className="h-12 w-12 skeleton rounded-md" />
                  <div className="h-12 w-12 skeleton rounded-md" />
                </div>

                <div className="flex gap-2">
                  <div className="h-10 w-32 skeleton rounded-md" />
                  <div className="h-10 w-24 skeleton rounded-md" />
                  <div className="h-10 w-24 skeleton rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-10">
        {/* TITLE + META */}
        <div className="space-y-3">
          <div className="h-6 w-2/3 skeleton rounded-md" />
          <div className="h-4 w-1/3 skeleton rounded-md" />
        </div>

        {/* CATEGORY + LOCATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="h-5 w-40 skeleton rounded" />
            <div className="h-16 skeleton rounded-lg" />
            <div className="h-16 skeleton rounded-lg" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="h-5 w-40 skeleton rounded" />
            <div className="h-32 skeleton rounded-lg" />
          </div>
        </div>

        {/* INCLUSIONS */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="h-5 w-40 skeleton rounded" />

          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 skeleton rounded" />
            <div className="h-12 skeleton rounded" />
            <div className="h-12 skeleton rounded" />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="h-5 w-32 skeleton rounded" />
              <div className="h-4 skeleton rounded" />
              <div className="h-4 skeleton rounded" />
              <div className="h-4 w-3/4 skeleton rounded" />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="h-5 w-32 skeleton rounded" />
              <div className="h-20 skeleton rounded" />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="h-5 w-32 skeleton rounded" />
              <div className="h-16 skeleton rounded" />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 min-h-[180px]">
            <div className="h-5 w-32 skeleton rounded" />
            <div className="h-12 skeleton rounded-md" />
            <div className="h-12 skeleton rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
