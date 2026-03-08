export default function RegisterPageSkeleton() {
  return (
    <main className="bg-[#F3F6FB] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="h-8 w-72 skeleton rounded"></div>

          <div className="flex gap-4">
            <div className="h-4 w-32 skeleton rounded"></div>
            <div className="h-4 w-32 skeleton rounded"></div>
            <div className="h-4 w-32 skeleton rounded"></div>
          </div>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-48 skeleton rounded"></div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="h-20 skeleton rounded-lg"></div>
            <div className="h-20 skeleton rounded-lg"></div>
            <div className="h-20 skeleton rounded-lg"></div>
          </div>
        </div>

        {/* FORM PROGRESS */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="h-4 w-full skeleton rounded"></div>
        </div>

        {/* FORM SECTIONS */}
        <div className="space-y-6">
          {/* PERSONAL DETAILS */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="h-5 w-40 skeleton rounded"></div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="h-5 w-40 skeleton rounded"></div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="h-5 w-40 skeleton rounded"></div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-12 skeleton rounded"></div>
              <div className="h-12 skeleton rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY PAYMENT BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
          <div className="h-5 w-40 skeleton rounded"></div>

          <div className="h-10 w-40 skeleton rounded"></div>
        </div>
      </div>
    </main>
  );
}
