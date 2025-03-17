import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/react";

const TimelineSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-zinc-200/20 bg-white/90 shadow-md dark:border-zinc-700/30 dark:bg-zinc-900/90">
      <CardBody className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-8 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
              <div className="h-8 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-10 rounded bg-zinc-200 dark:bg-zinc-700"
              ></div>
            ))}
          </div>

          <div className="flex space-x-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700"
              ></div>
            ))}
          </div>

          <Divider className="my-2" />

          <div className="relative">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mt-3 flex items-center">
                <div className="h-8 w-32 rounded-full bg-zinc-200 dark:bg-zinc-700 md:w-48"></div>
              </div>
            ))}

            <div className="absolute inset-y-0 left-1/4 w-0.5 bg-zinc-200 dark:bg-zinc-700">
              <div className="absolute -left-1/2 -top-2 h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TimelineSkeleton;
