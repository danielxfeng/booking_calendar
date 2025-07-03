# Book Me - an event calendar (frontend)

This project is a meeting room reservation system built by me and [Abdul](https://github.com/IbnBaqqi), for **Hive Helsinki**.
Abdul initialized the idea and developed an excellent backend using **Spring Boot**, while I focused on building the **frontend**.

- **Live Preview:** [booking-calendar-chi.vercel.app](https://booking-calendar-chi.vercel.app)  
- **GitHub Repo:** [github.com/danielxfeng/booking_calendar](https://github.com/danielxfeng/booking_calendar)
- **Link to Backend:** [https://github.com/IbnBaqqi/book-me](https://github.com/IbnBaqqi/book-me)

---

## Installation

```bash
git clone https://github.com/danielxfeng/booking_calendar.git
cd booking_calendar
npm install
npm run dev
```

---

## Features

- View weekly room bookings in a scrollable calendar view

- Add a new booking with room and time selection

- Delete an existing booking

- **Role-based access control** (RBAC):
  - **Staff** can delete **any** booking
  - **Students** can only delete **their own** bookings

- Built-in conflict prevention for overlapping bookings

- Mobile responsiveness achieved via **horizontal scrolling** — better suited than drag-and-drop for small screens

- Lightweight, **unstyled** prototype focused on functionality

---

## Tech Highlights

- **Three-layer stacked layout**
  - Base grid, booking overlays, and a floating form layer.
  - They are separated to reduce re-renders and decouple UI from logic.

- **TanStack Query** for auto-fetching and intelligent caching
  - Ensures a smooth user experience when switching calendar views, with minimal network requests and loading delays.

- **Axios interceptor** with token expiration handling
  - Gracefully attempts to recover expired tokens without disrupting the user.

- **Custom ScrollSlotPicker**
  - A UI component designed from scratch to offer an intuitive way to select time slots.

- **URL and state sync**
  - Enables deep-linking and state persistence when navigating between dates or sharing calendar views.

- **Jotai** for clean and minimalistic state management
  - Enables consistent state sharing across components.

- **Zod** schema validation integrated with **React Hook Form**
  - Ensures strong typing and robust form validation logic.

- **Vitest** for unit tests
  - Helps maintain code quality.

---

## Known Issues & Future Improvements

- UI is unstyled (basic prototype only)
- Support darkmode
- Scroll in view does not work on mobile (IOS?)
- Different color for my bookings
- Just keep the token in memory (It's fine)
- To Optimize the form labels.
- No logout button
- The "auto-find empty slot" algorithm can be optimized
- Cannot edit existing bookings
- Booking form does not allow changing the selected date
- Does not support inter-day bookings (Do we need that?)
- Use different background colors for different meeting rooms
- Display more booking info depending on block size
- Add a fixed table header for better scroll alignment
- Add more tests (unit, integration, E2E)

---

## Project Structure

```
src/
├── components/ # All UI components
│ ├── ui/ # Components from ShadCN UI
│ ├── BasicGrids/ # Base time × room grid layout
│ ├── BookingForm/ # A "sheet" component for booking create/update
│ ├── CalendarHeader/ # Week header
│ ├── ErrorBoundary/ # Global error fallback UI
│ ├── Loading/ # Spinner/loading placeholder
│ ├── Main/ # Main calendar layout entry
│ ├── OperationRow/ # Top operation bar
│ ├── ScrollSlotPicker/ # Custom scroll-based time slot picker
│ ├── TanQuery/ # Headless wrappers for fetching + hooks
│
├── lib/ # Logic, utilities, and global state
│ ├── apiFetcher.ts # Fetcher for calendar API
│ ├── atoms.ts # Jotai atoms
│ ├── axiosFetcher.ts # Axios instance with token handling
│ ├── bookingFormUtils.ts # BookingForm helpers
│ ├── errorHandler.ts # Error handling
│ ├── hooks/ # # Custom hooks: useStartController to manage the `start` atom
│ ├── normalizeStartDate.ts # Aligns start date from URL to calendar view
│ ├── schema.ts # Zod schemas for validation
│ ├── tokenStore.ts # Token persistence and sync
│ ├── tools.ts # Helper functions
│ ├── utils.ts # Utility function from ShadCN UI
│ ├── weekBookings.ts # Core data structure + generator
│
├── config.ts # Global configuration
├── App.tsx # Application entry point
```

## License

MIT

## ScreenShot

![Booking Calendar Screenshot](./public/screenshot.png)
