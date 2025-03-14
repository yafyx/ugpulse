import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Link } from "@nextui-org/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
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

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
}

const gradients = [
  "bg-gradient-to-b from-slate-700 to-slate-800",
  "bg-gradient-to-b from-zinc-700 to-zinc-800",
  "bg-gradient-to-b from-neutral-700 to-neutral-800",
  "bg-gradient-to-b from-stone-700 to-stone-800",
  "bg-gradient-to-b from-red-800 to-red-900",
  "bg-gradient-to-b from-orange-800 to-orange-900",
  "bg-gradient-to-b from-amber-800 to-amber-900",
  "bg-gradient-to-b from-yellow-800 to-yellow-900",
  "bg-gradient-to-b from-lime-800 to-lime-900",
  "bg-gradient-to-b from-green-800 to-green-900",
  "bg-gradient-to-b from-emerald-800 to-emerald-900",
  "bg-gradient-to-b from-teal-800 to-teal-900",
  "bg-gradient-to-b from-cyan-800 to-cyan-900",
  "bg-gradient-to-b from-sky-800 to-sky-900",
  "bg-gradient-to-b from-blue-800 to-blue-900",
  "bg-gradient-to-b from-indigo-800 to-indigo-900",
  "bg-gradient-to-b from-violet-800 to-violet-900",
  "bg-gradient-to-b from-purple-800 to-purple-900",
  "bg-gradient-to-b from-fuchsia-800 to-fuchsia-900",
  "bg-gradient-to-b from-pink-800 to-pink-900",
  "bg-gradient-to-b from-rose-800 to-rose-900",
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

// Scroll settings
const SCROLL_SENSITIVITY = 2; // Higher values make horizontal scrolling more sensitive

const Timeline: React.FC<{ events: Event[] }> = ({ events }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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

  // Process the events data
  const adjustedEvents = useMemo(() => {
    if (!events.length) return [];

    return events.map((event) => {
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
  }, [events]);

  // Calculate timeline date ranges
  const { earliestStart, latestEnd, displayStartDate, displayEndDate } =
    useMemo(() => {
      if (!adjustedEvents.length) {
        return {
          earliestStart: new Date(),
          latestEnd: new Date(),
          displayStartDate: new Date(),
          displayEndDate: new Date(),
        };
      }

      const earliest = adjustedEvents.reduce((earliest, event) => {
        const start = parseDate(event.start);
        return start < earliest ? start : earliest;
      }, parseDate(adjustedEvents[0].start));

      const latest = adjustedEvents.reduce((latest, event) => {
        const end = parseDate(event.end);
        return end > latest ? end : latest;
      }, parseDate(adjustedEvents[0].end));

      return {
        earliestStart: earliest,
        latestEnd: latest,
        displayStartDate: startOfMonth(earliest),
        displayEndDate: addDays(latest, 27),
      };
    }, [adjustedEvents]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate appropriate height based on content and lanes
  useEffect(() => {
    if (timelineRef.current && events.length > 0) {
      const eventPositions = calculateEventPositions(adjustedEvents);
      const maxLaneIndex = Math.max(
        ...eventPositions.map((e) => e.laneIndex),
        0,
      );
      const laneHeight = 36;
      const headerHeight = 80;

      // Calculate minimum needed height (lanes + header + some padding)
      const neededHeight = headerHeight + (maxLaneIndex + 1) * laneHeight + 20;

      // Use a reasonable height based on content, with minimum constraints
      // Remove the maximum constraint to allow full display or scrolling
      const calculatedHeight = Math.max(neededHeight, 250);
      setContentHeight(calculatedHeight);
    }
  }, [events, adjustedEvents]);

  // Auto-scroll to current date on initial render
  useEffect(() => {
    if (
      scrollContainerRef.current &&
      events.length > 0 &&
      !autoScrollComplete &&
      adjustedEvents.length > 0
    ) {
      // Wait a bit for the DOM to fully render
      setTimeout(() => {
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
      }, 500); // Slightly longer timeout to ensure rendering is complete
    }
  }, [
    events,
    autoScrollComplete,
    displayStartDate,
    earliestStart,
    latestEnd,
    adjustedEvents,
  ]);

  // Update selected event status when time changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (selectedEvent) {
        setSelectedEventStatus(getEventStatus(selectedEvent));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedEvent]);

  // Update status when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      setSelectedEventStatus(getEventStatus(selectedEvent));
    }
  }, [currentTime, selectedEvent]);

  // Mouse enter/leave handlers
  const handleMouseEnter = () => {
    setIsMouseOverTimeline(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOverTimeline(false);
  };

  // Handle wheel events to convert vertical scrolling to horizontal scrolling
  // Only when mouse is over the timeline
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current && isMouseOverTimeline) {
      e.preventDefault(); // Prevent the default vertical scroll only when mouse is over timeline
      scrollContainerRef.current.scrollLeft += e.deltaY * SCROLL_SENSITIVITY;
    }
  };

  const getEventStatus = (event: Event) => {
    const start = parseDate(event.start);
    const end = parseDate(event.end);
    const now = new Date();

    if (isBefore(now, start)) {
      const daysUntilStart = differenceInDays(start, now);
      const secondsLeft = differenceInSeconds(start, now);
      return {
        short: `${daysUntilStart}h`,
        full: `Dimulai dlm ${daysUntilStart} hari`,
        position: "start",
        secondsLeft,
      };
    } else if (isAfter(now, end)) {
      return {
        short: "Selesai",
        full: "Selesai",
        position: "end",
        secondsLeft: 0,
      };
    } else {
      const daysUntilEnd = differenceInDays(end, now);
      const secondsLeft = differenceInSeconds(end, now);
      return {
        short: `${daysUntilEnd}h`,
        full: `Berakhir dlm ${daysUntilEnd} hari`,
        position: "end",
        secondsLeft,
      };
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedEventStatus(getEventStatus(event));
    onOpen();
  };

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const allDates = [];
  let currentDate = displayStartDate;
  while (currentDate <= displayEndDate) {
    allDates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const months = allDates.reduce(
    (acc, date) => {
      const monthKey = format(date, "yyyy-MM");
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(date);
      return acc;
    },
    {} as { [key: string]: Date[] },
  );

  const currentTimePosition = (() => {
    const diffInSeconds = differenceInSeconds(currentTime, displayStartDate);
    const diffInDays = diffInSeconds / (24 * 60 * 60);
    return diffInDays * 40;
  })();

  const calculateEventPositions = (events: Event[]) => {
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

  const eventPositions = calculateEventPositions(adjustedEvents);
  const maxLaneIndex = Math.max(...eventPositions.map((e) => e.laneIndex));
  const laneHeight = 36;
  const headerHeight = 80;
  const eventAreaHeight = contentHeight - headerHeight;

  // Remove the limit on visible lanes to show all events
  const visibleLanes = maxLaneIndex + 1;

  // Set up the wheel event listener on the document
  useEffect(() => {
    // We need to handle wheel events at the document level to properly
    // manage when to prevent default scrolling
    const handleDocumentWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current || !isMouseOverTimeline) return;

      // Check if the mouse is over the timeline component
      // If so, prevent the default scroll and handle horizontal scrolling
      if (isMouseOverTimeline) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY * SCROLL_SENSITIVITY;
      }
    };

    // We need to use passive: false to be able to prevent default
    document.addEventListener("wheel", handleDocumentWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleDocumentWheel);
    };
  }, [isMouseOverTimeline]);

  return (
    <div
      className="timeline-container relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div className="flex items-center justify-between p-2">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              Scroll vertically to navigate horizontally
            </div>
          </div>
          <div
            className="overflow-x-auto overflow-y-auto"
            ref={scrollContainerRef}
            style={{
              height: `${Math.min(contentHeight, 400)}px`,
              maxHeight: "400px",
            }}
          >
            <div className="relative flex min-w-max flex-col" ref={timelineRef}>
              <div className="relative flex min-w-max flex-col">
                <div className="pointer-events-none absolute bottom-0 left-[-20px] right-0 top-28">
                  <div className="h-full w-full bg-[linear-gradient(to_right,transparent_39px,#a1a1aa1a_39px,#a1a1aa1a_40px,transparent_40px)] bg-[length:40px_100%] bg-repeat-x opacity-50"></div>
                </div>
                <div className="flex items-center p-2 dark:text-white">
                  {Object.keys(months).map((monthKey) => (
                    <div
                      key={monthKey}
                      className="sticky top-0 z-10 flex flex-col items-start"
                      style={{ width: `${months[monthKey].length * 40}px` }}
                    >
                      <h3 className="p-2 text-2xl font-bold">
                        {format(months[monthKey][0], "MMMM yyyy", {
                          locale: id,
                        })}
                      </h3>
                      <div className="flex">
                        {months[monthKey].map((date, index) => (
                          <div
                            key={`${monthKey}-${index}`}
                            className="w-10 text-sm text-black/70 dark:text-white/70"
                          >
                            {weekdays[date.getDay()]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start dark:text-white">
                  {Object.values(months).map((dates, monthIndex) => (
                    <div
                      key={monthIndex}
                      className="flex flex-wrap"
                      style={{ width: `${dates.length * 40}px` }}
                    >
                      {dates.map((date, dateIndex) => (
                        <div
                          key={dateIndex}
                          className="flex w-10 flex-col items-center"
                        >
                          <div className="flex items-center justify-center font-semibold">
                            {format(date, "d")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
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

                    if (event.laneIndex >= visibleLanes) return null;

                    return (
                      <div
                        key={index}
                        className={`${gradients[index % gradients.length]} absolute flex h-8 cursor-pointer items-center overflow-visible rounded-full p-2 text-white transition-all duration-300 hover:z-20 hover:shadow-lg hover:brightness-110`}
                        style={{
                          width: `${width}px`,
                          left: `${left}px`,
                          top: `${event.laneIndex * laneHeight}px`,
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        {status.position === "start" && (
                          <Tooltip
                            placement="right"
                            content={`${status.full} ${formatTimeLeft(status.secondsLeft)}`}
                          >
                            <Chip
                              size="sm"
                              variant="solid"
                              className="mr-1 bg-white/10 text-white"
                            >
                              {status.short}
                            </Chip>
                          </Tooltip>
                        )}
                        <span className="sticky left-0 z-10 flex flex-col truncate text-ellipsis whitespace-nowrap text-sm font-medium text-white drop-shadow-lg sm:text-base">
                          {event.kegiatan}
                        </span>
                        {status.position === "end" && (
                          <Tooltip
                            content={`${status.full} ${formatTimeLeft(status.secondsLeft)}`}
                          >
                            <Chip
                              size="sm"
                              variant="solid"
                              className="ml-2 bg-white/10 text-white"
                            >
                              {status.short}
                            </Chip>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                  <div
                    className="current-time-marker absolute bottom-0 top-[-40px] z-20 w-[2px] cursor-default bg-black transition-opacity hover:opacity-10 dark:bg-white"
                    style={{ left: `${currentTimePosition}px` }}
                  >
                    <div className="absolute left-[-30px] top-[-20px] rounded-full bg-black px-2 py-1 text-xs text-white shadow-lg dark:bg-white dark:text-black">
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
        hideCloseButton={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.1,
              },
            },
            exit: {
              y: 5,
              opacity: 0,
              transition: {
                duration: 0.1,
              },
            },
          },
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  {selectedEvent?.kegiatan}
                </h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-xs text-foreground-600 sm:text-start sm:text-sm">
                  {selectedEvent?.tanggal}
                </p>
                <Link
                  showAnchorIcon
                  href="https://baak.gunadarma.ac.id/"
                  className="truncate text-center text-xs text-foreground-500 hover:text-foreground sm:text-start"
                >
                  https://baak.gunadarma.ac.id/
                </Link>
              </ModalBody>
              <ModalFooter className="items-center justify-between">
                <Chip
                  variant="solid"
                  className="bg-black text-white dark:bg-white dark:text-black"
                >
                  {selectedEventStatus &&
                    `${selectedEventStatus.full} ${formatTimeLeft(selectedEventStatus.secondsLeft)}`}
                </Chip>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <style jsx>{`
        .pulse-animation {
          animation: pulse 1.5s ease-in-out;
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
          100% {
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }

        /* Add scroll indicator */
        .timeline-container::after {
          content: "";
          position: absolute;
          top: 0;
          right: 10px;
          width: 24px;
          height: 24px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='rgba(255, 255, 255, 0.5)' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
