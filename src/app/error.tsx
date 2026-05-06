"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-700 font-medium mb-2">加载失败</p>
        <p className="text-gray-400 text-sm mb-4">请检查网络连接后重试</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    </div>
  );
}
