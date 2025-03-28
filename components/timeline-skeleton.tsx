import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/react";

const TimelineSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-zinc-200/20 bg-white/90 shadow-md dark:border-zinc-700/30 dark:bg-zinc-900/90">
      <CardBody className="p-0">
        {/* Header Section */}
        <div className="flex flex-col items-start justify-between gap-3 border-b border-zinc-200/30 p-4 dark:border-zinc-700/30 sm:flex-row sm:items-center">
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {/* Last updated button skeleton */}
            <div className="h-8 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
            {/* Info text skeleton */}
            <div className="hidden h-6 w-44 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700 md:block"></div>
            <div className="block h-6 w-44 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700 sm:w-auto md:hidden"></div>
            {/* Today button skeleton */}
            <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent overflow-x-auto overflow-y-hidden">
          <div className="relative flex min-w-max flex-col">
            {/* Month and Weekday Headers */}
            <div className="sticky top-0 z-10 flex items-center bg-white/95 p-2 shadow-sm dark:bg-zinc-900/95 dark:text-white">
              {/* Month header */}
              <div
                className="relative flex flex-col items-start"
                style={{ width: "560px" }}
              >
                <div className="sticky left-0 z-10 bg-white/95 p-2 dark:bg-zinc-900/95">
                  <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700"></div>
                </div>
                <div className="flex">
                  {/* Weekday labels */}
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className="w-10">
                      <div className="h-5 w-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Days row */}
            <div className="flex items-start dark:text-white">
              <div className="flex flex-wrap" style={{ width: "560px" }}>
                {[...Array(14)].map((_, i) => (
                  <div key={i} className="flex w-10 flex-col items-center">
                    <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Lanes */}
            <div
              className="relative mt-2 flex-grow dark:text-white"
              style={{ height: "150px" }}
            >
              {/* Event blocks */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-8 animate-pulse rounded-full bg-zinc-700/80 dark:bg-zinc-800/80"
                  style={{
                    width: `${120 + i * 40}px`,
                    left: `${i * 70}px`,
                    top: `${i * 36}px`,
                  }}
                >
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <div className="h-8 w-28 rounded-lg bg-zinc-600/80 dark:bg-zinc-700/80"></div>
                  </div>
                </div>
              ))}

              {/* Current time marker */}
              <div
                className="absolute bottom-0 top-[-40px] z-20 w-[2px] animate-pulse bg-zinc-400 dark:bg-zinc-500"
                style={{
                  left: "180px",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="absolute left-1/2 top-[-20px] h-6 w-16 -translate-x-1/2 animate-pulse rounded-xl bg-zinc-400 dark:bg-zinc-500"></div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TimelineSkeleton;
