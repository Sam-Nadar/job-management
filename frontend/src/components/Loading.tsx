export default function Loading() {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0e1327]">
        <div className="relative w-16 h-16">
          {/* Neon Spinner */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-b-blue-500 rounded-full animate-spin-fast"></div>
        </div>
      </div>
    );
  }
  