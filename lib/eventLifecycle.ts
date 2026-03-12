export type EventStage = "upcoming" | "live" | "completed" | "results";

export function getEventStage(event: any): EventStage {
  const now = new Date();

  /* Normalize event date */
  const eventDate =
    event?.date instanceof Date
      ? event.date
      : event?.date?.toDate
        ? event.date.toDate()
        : new Date(event?.date);

  if (!eventDate || isNaN(eventDate.getTime())) {
    return "upcoming";
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  /* Highest priority */
  if (event.resultsPublished) {
    return "results";
  }

  /* Event happening today */
  if (today.getTime() === eventDay.getTime()) {
    return "live";
  }

  /* Event already finished */
  if (today > eventDay) {
    return "completed";
  }

  return "upcoming";
}
