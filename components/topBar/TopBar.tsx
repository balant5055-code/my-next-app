"use client";

export default function TopBar() {
  return (
    <div className="bg-orange-500 text-white text-sm">
      <div
        className="
          max-w-7xl mx-auto px-4 py-2
          flex items-center justify-between
        "
      >
        {/* LEFT: Phone */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <i className="fa fa-phone"></i>
          <p>
            Any Questions? Call Us:{" "}
            <span className="font-semibold">1-223-355-2214</span>
          </p>
        </div>

        {/* RIGHT: Actions */}
        <ul className="flex items-center gap-4 whitespace-nowrap">
          <li>
            <a
              href="/login"
              className="flex items-center gap-1 hover:text-orange-200 transition"
            >
              <i className="fa fa-sign-in"></i>
              <span className="hidden sm:inline">Member Login</span>
            </a>
          </li>
          <li>
            <a
              href="/register"
              className="flex items-center gap-1 hover:text-orange-200 transition"
            >
              <i className="fa fa-user"></i>
              <span className="hidden sm:inline">Register</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
