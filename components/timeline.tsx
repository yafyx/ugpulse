import React, { useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  parseISO,
  differenceInDays,
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

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
}

interface EventWithLane extends Event {
  laneIndex: number;
}

interface ProcessedData {
  adjustedEvents: Event[];
  earliestStart: Date;
  latestEnd: Date;
  displayStartDate: Date;
  displayEndDate: Date;
  allDates: Date[];
  months: { [key: string]: Date[] };
  eventPositions: EventWithLane[];
  maxLaneIndex: number;
}

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

// Dynamically import the client component with loading disabled to prevent server/client mismatch
const TimelineClient = dynamic(() => import("./timeline-client"), {
  loading: () => <TimelineSkeleton />,
  ssr: false,
});

const Timeline: React.FC<{ events: Event[] }> = ({ events }) => {
  const processedData = useMemo(() => {
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
  }, [events]);

  return <TimelineClient events={events} processedData={processedData} />;
};

export default Timeline;
