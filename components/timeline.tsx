"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Tooltip,
} from "@heroui/react";
import {
  parseISO,
  differenceInDays,
  differenceInSeconds,
  addDays,
  subDays,
  format,
  startOfMonth,
  isWithinInterval,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";
import { id } from "date-fns/locale";
import TimelineSkeleton from "./timeline-skeleton";
import {
  Event,
  EventWithLane,
  ProcessedData,
  EventStatusCache,
} from "@/lib/types";
import { History } from "lucide-react";
import VersionHistoryModal from "./version-history-modal";

// Create a global status cache that persists between renders
const eventStatusCache: EventStatusCache = new Map();

const eventColors = [
  "bg-zinc-800/95 dark:bg-zinc-800/95",
  "bg-zinc-700/95 dark:bg-zinc-700/95",
  "bg-zinc-900/95 dark:bg-zinc-900/95",
  "bg-slate-800/95 dark:bg-slate-800/95",
  "bg-slate-700/95 dark:bg-slate-700/95",
  "bg-slate-900/95 dark:bg-slate-900/95",
  "bg-stone-800/95 dark:bg-stone-800/95",
  "bg-stone-700/95 dark:bg-stone-700/95",
  "bg-stone-900/95 dark:bg-stone-900/95",
  "bg-gray-800/95 dark:bg-gray-800/95",
  "bg-gray-700/95 dark:bg-gray-700/95",
  "bg-gray-900/95 dark:bg-gray-900/95",
  "bg-neutral-800/95 dark:bg-neutral-800/95",
  "bg-neutral-700/95 dark:bg-neutral-700/95",
  "bg-neutral-900/95 dark:bg-neutral-900/95",
];

const parseDate = (dateString: string, endDateString?: string) => {
  const [day, month, year] = dateString.split(" ");
  const monthMap: { [key: string]: string } = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  let parsedYear = year;
  if (!year && endDateString) {
    const endYear = endDateString.split(" ")[2];
    parsedYear = endYear;
  }

  return parseISO(`${parsedYear}-${monthMap[month]}-${day.padStart(2, "0")}`);
};

const SCROLL_SENSITIVITY = 2; // Higher values make horizontal scrolling more sensitive

// Helper function to calculate event positions
const calculateEventPositions = (events: Event[]): EventWithLane[] => {
  const lanes: { start: Date; end: Date }[] = [];
  return events.map((event) => {
    const start = parseDate(event.start, event.end);
    const end = parseDate(event.end);
    let laneIndex = lanes.findIndex(
      (lane) =>
        !isWithinInterval(start, { start: lane.start, end: lane.end }) &&
        !isWithinInterval(end, { start: lane.start, end: lane.end }),
    );

    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push({ start, end });
    } else {
      lanes[laneIndex] = {
        start: isBefore(start, lanes[laneIndex].start)
          ? start
          : lanes[laneIndex].start,
        end: isAfter(end, lanes[laneIndex].end) ? end : lanes[laneIndex].end,
      };
    }

    return { ...event, laneIndex };
  });
};

// Cache the processed data with a key based on events list length and some event properties
const dataCache = new Map<string, ProcessedData>();

// Process the data and return cached result with stable object references
const processTimelineData = (events: Event[]): ProcessedData => {
  if (!events.length)
    return {
      adjustedEvents: [],
      earliestStart: new Date(),
      latestEnd: new Date(),
      displayStartDate: new Date(),
      displayEndDate: new Date(),
      allDates: [],
      months: {},
      eventPositions: [],
      maxLaneIndex: 0,
    };

  const adjustedEvents = events.map((event) => {
    const start = parseDate(event.start, event.end);
    const end = parseDate(event.end);
    if (isSameDay(start, end)) {
      return {
        ...event,
        start: format(subDays(end, 7), "d MMMM yyyy", { locale: id }),
      };
    }
    return {
      ...event,
      start: format(start, "d MMMM yyyy", { locale: id }),
      end: format(end, "d MMMM yyyy", { locale: id }),
    };
  });

  // Calculate date ranges
  const earliestStart = adjustedEvents.reduce((earliest, event) => {
    const start = parseDate(event.start);
    return start < earliest ? start : earliest;
  }, parseDate(adjustedEvents[0].start));

  const latestEnd = adjustedEvents.reduce((latest, event) => {
    const end = parseDate(event.end);
    return end > latest ? end : latest;
  }, parseDate(adjustedEvents[0].end));

  const displayStartDate = startOfMonth(earliestStart);
  const displayEndDate = addDays(latestEnd, 27);

  // Generate all dates
  const allDates: Date[] = [];
  let currentDate = displayStartDate;
  while (currentDate <= displayEndDate) {
    allDates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  // Group dates by month
  const months = allDates.reduce<{ [key: string]: Date[] }>((acc, date) => {
    const monthKey = format(date, "yyyy-MM");
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(date);
    return acc;
  }, {});

  // Calculate event positions
  const eventPositions = calculateEventPositions(adjustedEvents);
  const maxLaneIndex = Math.max(...eventPositions.map((e) => e.laneIndex), 0);

  return {
    adjustedEvents,
    earliestStart,
    latestEnd,
    displayStartDate,
    displayEndDate,
    allDates,
    months,
    eventPositions,
    maxLaneIndex,
  };
};

const Timeline: React.FC<{
  events: Event[];
  onRefresh?: () => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
}> = ({ events, onRefresh, lastUpdated, isRefreshing = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    isOpen: isEventModalOpen,
    onOpen: onEventModalOpen,
    onOpenChange: onEventModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isHistoryModalOpen,
    onOpen: onHistoryModalOpen,
    onClose: onHistoryModalClose,
  } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventStatus, setSelectedEventStatus] = useState<{
    short: string;
    full: string;
    position: string;
    secondsLeft: number;
  } | null>(null);
  const [contentHeight, setContentHeight] = useState(300); // Default height
  const [autoScrollComplete, setAutoScrollComplete] = useState(false);
  const [isMouseOverTimeline, setIsMouseOverTimeline] = useState(false);
  const [isHoveringMarker, setIsHoveringMarker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Generate a cache key based on the events
  const cacheKey = useMemo(() => {
    if (!events.length) return "empty";
    // Use first and last event dates plus count as key for daily caching
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    return `${events.length}-${firstEvent.start}-${lastEvent.end}-${new Date().toISOString().split("T")[0]}`;
  }, [events]);

  // Process data with caching for daily reuse
  const processedData = useMemo(() => {
    // Return cached data if available
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey)!;
    }

    // Process data and store in cache
    const data = processTimelineData(events);
    dataCache.set(cacheKey, data);
    return data;
  }, [events, cacheKey]);

  const {
    adjustedEvents,
    earliestStart,
    latestEnd,
    displayStartDate,
    displayEndDate,
    allDates,
    months,
    eventPositions,
    maxLaneIndex,
  } = processedData;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Update current time every second with debounce
  useEffect(() => {
    // Update less frequently (every 5 seconds) to reduce calculations
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate appropriate height based on content and lanes
  useEffect(() => {
    if (timelineRef.current && events.length > 0) {
      const laneHeight = 36;
      const headerHeight = 80;

      // Calculate minimum needed height (lanes + header + some padding)
      const neededHeight = headerHeight + (maxLaneIndex + 1) * laneHeight + 20;

      // Add extra height on mobile for better visibility
      const calculatedHeight = isMobile
        ? Math.max(neededHeight, 400)
        : neededHeight;
      setContentHeight(calculatedHeight);
    }
  }, [events, maxLaneIndex, isMobile]);

  // Auto-scroll to current date on initial render with requestAnimationFrame
  useEffect(() => {
    if (
      scrollContainerRef.current &&
      events.length > 0 &&
      !autoScrollComplete &&
      adjustedEvents.length > 0
    ) {
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        if (!scrollContainerRef.current) return;

        const currentDate = new Date();

        // Find position to scroll to - default to current date if within range
        let targetDate = currentDate;
        let isCurrentDateInRange = isWithinInterval(currentDate, {
          start: earliestStart,
          end: latestEnd,
        });

        if (!isCurrentDateInRange) {
          // If current date is outside range, scroll to earliest upcoming event or latest past event
          if (isBefore(currentDate, earliestStart)) {
            targetDate = earliestStart;
          } else {
            targetDate = latestEnd;
          }
        }

        // Calculate the day index from the start of the display range
        const diffDays = differenceInDays(targetDate, displayStartDate);

        // Each day is 40px wide
        const dayWidth = 40;
        const scrollPosition = diffDays * dayWidth;

        // Get the container width to center the target date
        const containerWidth = scrollContainerRef.current.clientWidth;

        // Center the target date with an offset to show more future events
        // Use 0.4 to position the current date slightly left of center (40% from left edge)
        const targetScrollPosition = Math.max(
          0,
          scrollPosition - containerWidth * 0.4,
        );

        // Scroll to the calculated position with smooth animation
        scrollContainerRef.current.scrollTo({
          left: targetScrollPosition,
          behavior: "smooth",
        });

        // Add a brief highlight effect to the current date marker
        const currentTimeMarker = timelineRef.current?.querySelector(
          ".current-time-marker",
        );
        if (currentTimeMarker instanceof HTMLElement) {
          currentTimeMarker.classList.add("pulse-animation");
          setTimeout(() => {
            currentTimeMarker.classList.remove("pulse-animation");
          }, 2000);
        }

        setAutoScrollComplete(true);
      });
    }
  }, [
    events,
    autoScrollComplete,
    displayStartDate,
    earliestStart,
    latestEnd,
    adjustedEvents,
  ]);

  // Mouse enter/leave handlers
  const handleMouseEnter = () => {
    setIsMouseOverTimeline(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOverTimeline(false);
  };

  // Get event status with caching to prevent repeated calculations
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const cacheKey = `${event.kegiatan}-${event.start}-${event.end}-${now.getTime()}`; // Add current time to cache key

    // Check if we have a cached status less than 1 second old
    const cachedStatus = eventStatusCache.get(cacheKey);
    if (cachedStatus && now.getTime() - cachedStatus.timestamp < 1000) {
      return cachedStatus;
    }

    // Calculate new status
    const start = parseDate(event.start);
    const end = parseDate(event.end);

    let status: any;

    if (isBefore(now, start)) {
      const daysUntilStart = differenceInDays(start, now);
      const secondsLeft = differenceInSeconds(start, now);
      status = {
        short: `${daysUntilStart}h`,
        full: `Dimulai dlm ${daysUntilStart} hari`,
        position: "start",
        secondsLeft,
      };
    } else if (isAfter(now, end)) {
      status = {
        short: "Selesai",
        full: "Selesai",
        position: "end",
        secondsLeft: 0,
      };
    } else {
      const daysUntilEnd = differenceInDays(end, now);
      const secondsLeft = differenceInSeconds(end, now);
      status = {
        short: `${daysUntilEnd}h`,
        full: `Berakhir dlm ${daysUntilEnd} hari`,
        position: "end",
        secondsLeft,
      };
    }

    // Add timestamp and cache
    status.timestamp = now.getTime();
    eventStatusCache.set(cacheKey, status);

    return status;
  };

  // Update selected event status when time changes
  useEffect(() => {
    if (!selectedEvent) return;

    // Force status update when currentTime changes
    setSelectedEventStatus(getEventStatus(selectedEvent));
  }, [selectedEvent, currentTime]);

  // Optimize wheel event handling with requestAnimationFrame
  useEffect(() => {
    // We need to handle wheel events at the document level to properly
    // manage when to prevent default scrolling
    let frameId: number;
    let lastScrollLeft = 0;

    const handleDocumentWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current || !isMouseOverTimeline) return;

      // Check if the mouse is over the timeline component
      // If so, prevent the default scroll and handle horizontal scrolling
      if (isMouseOverTimeline) {
        e.preventDefault();

        // Use requestAnimationFrame to optimize scroll performance
        if (frameId) {
          cancelAnimationFrame(frameId);
        }

        frameId = requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft +=
              e.deltaY * SCROLL_SENSITIVITY;
            lastScrollLeft = scrollContainerRef.current.scrollLeft;
          }
        });
      }
    };

    // We need to use passive: false to be able to prevent default
    document.addEventListener("wheel", handleDocumentWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleDocumentWheel);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isMouseOverTimeline]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedEventStatus(getEventStatus(event));
    onEventModalOpen();
  };

  // Memoize the time formatting function to prevent unnecessary calculations
  const formatTimeLeft = useMemo(() => {
    return (seconds: number) => {
      const hours = Math.floor((seconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
  }, []);

  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Calculate current time position only when current time changes
  const currentTimePosition = useMemo(() => {
    const diffInSeconds = differenceInSeconds(currentTime, displayStartDate);
    const diffInDays = diffInSeconds / (24 * 60 * 60);
    return diffInDays * 40;
  }, [currentTime, displayStartDate]);

  const laneHeight = 36;
  const headerHeight = 80;
  const eventAreaHeight = contentHeight - headerHeight;

  // Remove the limit on visible lanes to show all events
  const visibleLanes = maxLaneIndex + 1;

  return (
    <div
      className="timeline-container relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="overflow-hidden border border-zinc-200/20 bg-white/90 dark:border-zinc-700/30 dark:bg-zinc-900/90">
        <CardBody className="p-0">
          <div className="flex flex-col items-start justify-between gap-3 border-b border-zinc-200/30 p-4 dark:border-zinc-700/30 sm:flex-row sm:items-center">
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              {lastUpdated && (
                <Tooltip content="Klik untuk melihat riwayat pembaruan">
                  <Button
                    size="sm"
                    variant="flat"
                    className="w-full gap-2 bg-zinc-100/50 text-zinc-800 hover:bg-zinc-200/60 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700/60 sm:w-auto"
                    onClick={onHistoryModalOpen}
                  >
                    <History className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      Terakhir diupdate: {lastUpdated}
                    </span>
                  </Button>
                </Tooltip>
              )}
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
              <div className="hidden rounded-full border border-zinc-200/30 bg-zinc-100/10 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-700/30 dark:bg-zinc-800/30 dark:text-zinc-400 md:block">
                Scroll untuk melihat lebih banyak
              </div>
              <div className="block w-full rounded-full border border-zinc-200/30 bg-zinc-100/10 px-3 py-1 text-center text-xs text-zinc-500 dark:border-zinc-700/30 dark:bg-zinc-800/30 dark:text-zinc-400 sm:w-auto md:hidden">
                Geser untuk melihat timeline
              </div>
              <Button
                size="sm"
                variant="flat"
                className="w-full bg-zinc-100/50 text-zinc-800 hover:bg-zinc-200/60 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700/60 sm:w-auto"
                onClick={() => {
                  // Scroll to current date
                  if (scrollContainerRef.current) {
                    const currentDate = new Date();
                    const diffDays = differenceInDays(
                      currentDate,
                      displayStartDate,
                    );
                    const scrollPosition = diffDays * 40;
                    const containerWidth =
                      scrollContainerRef.current.clientWidth;
                    const targetScrollPosition = Math.max(
                      0,
                      scrollPosition - containerWidth * 0.4,
                    );

                    scrollContainerRef.current.scrollTo({
                      left: targetScrollPosition,
                      behavior: "smooth",
                    });

                    // Highlight current time marker
                    const currentTimeMarker =
                      timelineRef.current?.querySelector(
                        ".current-time-marker",
                      );
                    if (currentTimeMarker instanceof HTMLElement) {
                      currentTimeMarker.classList.add("pulse-animation");
                      setTimeout(() => {
                        currentTimeMarker.classList.remove("pulse-animation");
                      }, 2000);
                    }
                  }
                }}
              >
                Hari Ini
              </Button>
            </div>
          </div>
          <div
            className="scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent overflow-x-auto overflow-y-hidden"
            ref={scrollContainerRef}
            style={{
              height: "auto",
            }}
          >
            <div className="relative flex min-w-max flex-col" ref={timelineRef}>
              <div className="relative flex min-w-max flex-col">
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-28">
                  <div className="h-full w-full bg-[linear-gradient(to_right,transparent_19px,rgba(161,161,170,0.15)_19px,rgba(161,161,170,0.15)_20px,transparent_20px)] bg-[length:40px_100%] bg-repeat-x dark:bg-[linear-gradient(to_right,transparent_19px,rgba(161,161,170,0.15)_19px,rgba(161,161,170,0.15)_20px,transparent_20px)]"></div>
                </div>
                <div className="sticky top-0 z-10 flex items-center bg-white/95 p-2 shadow-sm dark:bg-zinc-900/95 dark:text-white">
                  {Object.keys(months).map((monthKey, monthIdx) => (
                    <div
                      key={monthKey}
                      className="relative flex flex-col items-start"
                      style={{ width: `${months[monthKey].length * 40}px` }}
                    >
                      <div className="sticky left-0 z-10 bg-white/95 p-2 dark:bg-zinc-900/95">
                        <h3 className="bg-gradient-to-b from-purple-800 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                          {format(months[monthKey][0], "MMMM yyyy", {
                            locale: id,
                          })}
                        </h3>
                      </div>
                      <div className="flex">
                        {months[monthKey].map((date: Date, index: number) => (
                          <div
                            key={`${monthKey}-${index}`}
                            className="w-10 text-sm font-medium text-zinc-500 dark:text-zinc-400"
                          >
                            {weekdays[date.getDay()]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start dark:text-white">
                  {(Object.values(months) as Date[][]).map(
                    (dates: Date[], monthIndex) => (
                      <div
                        key={monthIndex}
                        className="flex flex-wrap"
                        style={{ width: `${dates.length * 40}px` }}
                      >
                        {dates.map((date: Date, dateIndex: number) => {
                          const isToday = isSameDay(date, new Date());
                          return (
                            <div
                              key={dateIndex}
                              className={`flex w-10 flex-col items-center ${
                                isToday ? "relative" : ""
                              }`}
                            >
                              <div className="flex items-center justify-center font-semibold text-zinc-700 dark:text-zinc-300">
                                {format(date, "d")}
                              </div>
                              {isToday && (
                                <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-zinc-500 dark:bg-zinc-400"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ),
                  )}
                </div>
                <div
                  className="relative mt-2 flex-grow dark:text-white"
                  style={{
                    height: `${visibleLanes * laneHeight}px`,
                  }}
                >
                  {eventPositions.map((event, index) => {
                    const start = parseDate(event.start);
                    const end = parseDate(event.end);
                    const width = (differenceInDays(end, start) + 1) * 40;
                    const left = differenceInDays(start, displayStartDate) * 40;
                    const status = getEventStatus(event);

                    // Skip if the event is outside visible lanes
                    if (event.laneIndex >= visibleLanes) return null;

                    // Calculate if this event is active (happening now)
                    const isActive = isWithinInterval(new Date(), {
                      start,
                      end,
                    });

                    return (
                      <div
                        key={index}
                        className={`${
                          eventColors[index % eventColors.length]
                        } group absolute flex h-8 cursor-pointer items-center overflow-visible rounded-full border border-white/20 p-2 text-white transition-all duration-300 hover:z-20 hover:shadow-md ${
                          isMobile ? "z-10 min-w-[120px]" : ""
                        }`}
                        style={{
                          width: `${isMobile && width < 120 ? 120 : width}px`,
                          left: `${left}px`,
                          top: `${event.laneIndex * laneHeight}px`,
                          boxShadow: isActive
                            ? "0 0 10px rgba(0, 0, 0, 0.2)"
                            : "none",
                          WebkitTapHighlightColor: "transparent",
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <span className="sticky left-1 z-10 flex flex-col truncate text-ellipsis whitespace-nowrap pl-1 text-sm font-medium text-white drop-shadow-sm sm:text-base">
                          {event.kegiatan}
                        </span>

                        {!isMobile && status.position === "start" && (
                          <div className="group absolute right-[calc(100%+5px)] z-30">
                            <Chip
                              size="sm"
                              variant="solid"
                              className={`whitespace-nowrap bg-zinc-800/95 text-white transition-all duration-300 dark:bg-zinc-700/95 ${
                                status.full !== "Selesai" &&
                                "group-hover:translate-x-[-8px] group-hover:opacity-0"
                              }`}
                            >
                              {status.short}
                            </Chip>
                            {status.full !== "Selesai" && (
                              <Chip
                                size="sm"
                                variant="solid"
                                className="absolute right-0 top-0 w-auto max-w-0 translate-x-[-8px] scale-90 overflow-hidden whitespace-nowrap bg-zinc-800/95 text-white opacity-0 transition-all duration-300 group-hover:max-w-[300px] group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-700/95"
                              >
                                {status.full}{" "}
                                {formatTimeLeft(status.secondsLeft)}
                              </Chip>
                            )}
                          </div>
                        )}

                        {!isMobile && status.position === "end" && (
                          <div className="group absolute left-[calc(100%+5px)] z-30">
                            <Chip
                              size="sm"
                              variant="solid"
                              className={`whitespace-nowrap bg-zinc-800/95 text-white transition-all duration-300 dark:bg-zinc-700/95 ${
                                status.full !== "Selesai" &&
                                "group-hover:translate-x-[8px] group-hover:opacity-0"
                              }`}
                            >
                              {status.short}
                            </Chip>
                            {status.full !== "Selesai" && (
                              <Chip
                                size="sm"
                                variant="solid"
                                className="absolute left-0 top-0 w-auto max-w-0 translate-x-[8px] scale-90 overflow-hidden whitespace-nowrap bg-zinc-800/95 text-white opacity-0 transition-all duration-300 group-hover:max-w-[300px] group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-700/95"
                              >
                                {status.full}{" "}
                                {formatTimeLeft(status.secondsLeft)}
                              </Chip>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div
                    className="current-time-marker absolute bottom-0 top-[-40px] z-20 w-[2px] cursor-default bg-zinc-800 transition-all duration-300 dark:bg-zinc-300"
                    style={{
                      left: `${currentTimePosition}px`,
                      transform: "translateX(-50%)",
                      opacity: isHoveringMarker ? 0.5 : 1,
                    }}
                    onMouseEnter={() => setIsHoveringMarker(true)}
                    onMouseLeave={() => setIsHoveringMarker(false)}
                  >
                    <div className="absolute left-1/2 top-[-20px] -translate-x-1/2 whitespace-nowrap rounded-xl border border-zinc-300/20 bg-zinc-800 px-2 py-[0.5px] text-sm font-medium text-white shadow-sm dark:border-zinc-600/20 dark:bg-zinc-300 dark:text-zinc-900">
                      {format(currentTime, "HH:mm:ss")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal
        placement="center"
        hideCloseButton={false}
        isOpen={isEventModalOpen}
        onOpenChange={onEventModalOpenChange}
        classNames={{
          base: "bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/20 dark:border-zinc-700/20 mx-4 max-w-[95vw] sm:mx-0",
          header: "border-b border-zinc-200/20 dark:border-zinc-700/20",
          footer: "border-t border-zinc-200/20 dark:border-zinc-700/20",
          body: "gap-3",
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.15,
                ease: "easeOut",
              },
            },
            exit: {
              y: 5,
              opacity: 0,
              transition: {
                duration: 0.1,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-zinc-800 dark:text-zinc-100">
                <h2 className="text-base font-semibold leading-none tracking-tight sm:text-lg">
                  {selectedEvent?.kegiatan}
                </h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedEvent?.tanggal}
                </p>
                <Link
                  showAnchorIcon
                  href="https://baak.gunadarma.ac.id/"
                  className="truncate text-xs text-zinc-500 transition duration-200 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  https://baak.gunadarma.ac.id/
                </Link>
              </ModalBody>
              <ModalFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Chip
                  variant="solid"
                  className="w-full border-0 bg-zinc-800/90 text-center text-white sm:w-auto"
                >
                  {selectedEventStatus && selectedEventStatus.full === "Selesai"
                    ? "Selesai"
                    : `${selectedEventStatus?.full} ${formatTimeLeft(
                        selectedEventStatus?.secondsLeft || 0,
                      )}`}
                </Chip>
                <Button
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className="w-full bg-zinc-100/50 text-zinc-800 hover:bg-zinc-200/60 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700/60 sm:w-auto"
                >
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <VersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={onHistoryModalClose}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      <style jsx>{`
        .pulse-animation {
          animation: pulse 1.5s ease-in-out;
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
            box-shadow: 0 0 0 0 rgba(24, 24, 27, 0.5);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 0 10px rgba(24, 24, 27, 0);
          }
          100% {
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(24, 24, 27, 0);
          }
        }

        /* Scrollbar styling for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          height: 5px;
        }

        .scrollbar-thumb-zinc-300::-webkit-scrollbar-thumb {
          background-color: rgba(212, 212, 216, 0.4);
          border-radius: 9999px;
        }

        .dark .scrollbar-thumb-zinc-700::-webkit-scrollbar-thumb {
          background-color: rgba(63, 63, 70, 0.4);
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }

        /* Disable mobile tap highlight */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
