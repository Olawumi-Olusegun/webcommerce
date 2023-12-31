"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {


  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <h2>
        Cause: <span className="text-red-400">{error.message}</span>
      </h2>

      <button
        onClick={

          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}