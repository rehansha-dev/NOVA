export interface ScheduleEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

function convertToMinutes(time: string) {
  const [timePart, modifier] = time.split(" ");

  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

export function findTimeClash(
  newEvent: ScheduleEvent,
  existingEvents: ScheduleEvent[]
) {
  return (
    existingEvents.find((existingEvent) => {
      if (
        existingEvent.id === newEvent.id ||
        existingEvent.date !== newEvent.date
      ) {
        return false;
      }

      const newStart = convertToMinutes(newEvent.startTime);
      const newEnd = convertToMinutes(newEvent.endTime);

      const existingStart = convertToMinutes(
        existingEvent.startTime
      );

      const existingEnd = convertToMinutes(
        existingEvent.endTime
      );

      return (
        newStart < existingEnd &&
        existingStart < newEnd
      );
    }) ?? null
  );
}

export function hasTimeClash(
  newEvent: ScheduleEvent,
  existingEvents: ScheduleEvent[]
) {
  return findTimeClash(newEvent, existingEvents) !== null;
}