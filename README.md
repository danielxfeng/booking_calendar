# Book Me - an event calendar (frontend)

This project is a meeting room reservation system built by me and [Abdul](https://github.com/IbnBaqqi), for **Hive Helsinki**.
Abdul initialized the idea and developed an excellent backend using **Spring Boot**, while I focused on building the **frontend**.

- **Live Preview:** [booking-calendar-chi.vercel.app](https://booking-calendar-chi.vercel.app)  
- **GitHub Repo:** [github.com/danielxfeng/booking_calendar](https://github.com/danielxfeng/booking_calendar)

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
- **Role-based access control** (ABAC):
  - **Staff** can delete **any** booking
  - **Students** can only delete **their own** bookings
- Built-in conflict prevention for overlapping bookings
- Mobile responsiveness achieved via **horizontal scrolling** — better suited than drag-and-drop for small screens
- Lightweight, **unstyled** prototype focused on functionality

---

## Tech Highlights

- **Three-layer stacked layout**:
  - Base grid (time x room)
  - Booking overlay layer
  - Floating sheet layer for booking form
- **URL and state sync**: two-way binding between calendar state and address bar
- **TanStack Query** for auto-fetching and intelligent caching
- **Jotai** for clean and minimalistic state management
- **Custom ScrollSlotPicker**: handcrafted time-slot picker component
- **Zod** schema validation integrated with React Hook Form
- **Vitest** for unit tests

---

## Known Issues & Future Improvements

- UI is unstyled (basic prototype only)
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

## License

MIT

## ScreenShot

![Booking Calendar Screenshot](./public/screenshot.png)