import type { CSSProperties } from 'react';
import { addHours, format, isBefore, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

import { BOOKING_TIME_ZONE, OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';

import type {
  BookingFromApi,
  BookingFromApiIsoTime,
  Rooms,
  RoomsIsoTime,
  UpsertBooking,
  UpsertBookingIsoTime,
} from './schema';

/**
 * @summary Returns a local time format of date
 */
const newDate = (date: string): Date => {
  const [y, m, d] = date.split('-').map(Number);
  return startOfDay(new Date(y, m - 1, d));
};

const styleGenerator = (
  sizeW?: number,
  sizeH?: number,
  left?: number,
  top?: number,
): CSSProperties | undefined => {
  const w =
    sizeW !== undefined
      ? {
          width: `${sizeW}px`,
          minWidth: `${sizeW}px`,
          maxWidth: `${sizeW}px`,
        }
      : {};

  const h =
    sizeH !== undefined
      ? {
          height: `${sizeH}px`,
          minHeight: `${sizeH}px`,
          maxHeight: `${sizeH}px`,
        }
      : {};

  const l =
    left != undefined
      ? {
          left: `${left}px`,
        }
      : {};

  const t =
    top != undefined
      ? {
          top: `${top}px`,
        }
      : {};

  return { ...w, ...h, ...l, ...t };
};

const gridStyleGenerator = (sizeW: number, sizeH?: number): CSSProperties => {
  const basic = {
    gridTemplateColumns: `repeat(7, ${sizeW}px)`,
  };

  return { ...basic, ...styleGenerator(sizeW * 7, sizeH) };
};

const formatToDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

const formatToDateTime = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * @summary Returns the Date object by given gird cell
 */
const timeFromCellIdx = (rowIdx: number, cellBaseTime: Date): Date => {
  return addHours(cellBaseTime, rowIdx);
};

const isPast = (paramTime: Date, curr: Date): boolean => {
  return isBefore(paramTime, curr);
};

/**
 * Returns a new dateTime in string
 * for example: prevStr: 2010-02-23T15:20 newDate: 2020-02-11
 * returns: 2020-02-11T15:20
 */
const changeDate = (prevStr: string, newDate: Readonly<Date>): string => {
  const prevDate = new Date(prevStr);
  const copiedNewDate = new Date(newDate);
  copiedNewDate.setHours(prevDate.getHours(), prevDate.getMinutes(), 0, 0);
  return formatToDateTime(copiedNewDate);
};

const slotsInAHour = 60 / TIME_SLOT_INTERVAL;

// One row per hour
const rowsArr = Array.from(
  { length: (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour },
  (_, i) => i + OPEN_HOURS_IDX[0] / slotsInAHour,
);

const isoTimeRoomsToLocalTimeRooms = (rooms: RoomsIsoTime): Rooms => {
  return rooms.map((room) => ({
    roomId: room.roomId,
    roomName: room.roomName,
    slots: room.slots.map((slot) => isoTimeApiToLocalTimeApi(slot)),
  }));
};

const isoTimeApiToLocalTimeApi = (booking: BookingFromApiIsoTime): BookingFromApi => {
  return {
    id: booking.id,
    start: formatInTimeZone(new Date(booking.start), BOOKING_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ss"),
    end: formatInTimeZone(new Date(booking.end), BOOKING_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ss"),
    bookedBy: booking.bookedBy,
  };
};

const localTimeUpsertToIsoTimeUpsert = (booking: UpsertBooking): UpsertBookingIsoTime => {
  return {
    roomId: booking.roomId,
    start: formatInTimeZone(
      fromZonedTime(booking.start, BOOKING_TIME_ZONE),
      'UTC',
      "yyyy-MM-dd'T'HH:mm:ss'Z'",
    ),
    end: formatInTimeZone(
      fromZonedTime(booking.end, BOOKING_TIME_ZONE),
      'UTC',
      "yyyy-MM-dd'T'HH:mm:ss'Z'",
    ),
  };
};

export {
  changeDate,
  formatToDate,
  formatToDateTime,
  gridStyleGenerator,
  isoTimeApiToLocalTimeApi,
  isoTimeRoomsToLocalTimeRooms,
  isPast,
  localTimeUpsertToIsoTimeUpsert,
  newDate,
  rowsArr,
  slotsInAHour,
  styleGenerator,
  timeFromCellIdx,
};
