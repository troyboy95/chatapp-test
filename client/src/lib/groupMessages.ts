import { format, isToday, isYesterday } from "date-fns";

export function groupMessagesByDate(msgs: any) {
  const groups: Record<string, any> = {};

  msgs.forEach((m: any) => {
    const d = new Date(m.createdAt);
    let label = format(d, "PPP"); // e.g. Sep 13, 2025

    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";

    if (!groups[label]) groups[label] = [];
    groups[label].push(m);
  });

  return groups;
}

