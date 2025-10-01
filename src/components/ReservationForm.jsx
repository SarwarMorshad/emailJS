// src/components/ReservationForm.jsx
import { useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_TEMPLATE_ID_ADMIN,
  EMAILJS_TEMPLATE_ID_USER, // optional auto-reply
} from "../emailjsConfig";

export default function ReservationForm() {
  const formRef = useRef(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  // For the <input type="date" min>
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Service hours
  const OPEN_TIME = "11:00";
  const CLOSE_TIME = "22:00";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const data = new FormData(form);

    const date = data.get("reservation_date");
    const time = data.get("reservation_time");

    // Basic checks
    if (!date || !time) {
      setStatus({ state: "error", message: "Please choose a date and time." });
      return;
    }

    const selected = new Date(`${date}T${time}`);
    const now = new Date();
    if (selected < now) {
      setStatus({ state: "error", message: "Please select a time in the future." });
      return;
    }

    if (time < OPEN_TIME || time > CLOSE_TIME) {
      setStatus({
        state: "error",
        message: `Reservations are accepted from ${OPEN_TIME} to ${CLOSE_TIME}.`,
      });
      return;
    }

    // Honeypot (if bots fill this, we silently succeed)
    if (data.get("website")) {
      setStatus({ state: "success", message: "Reservation request sent!" });
      form.reset();
      return;
    }

    // Derived display value for templates
    const derivedInput = form.querySelector("#reservation_datetime_display");
    if (derivedInput) derivedInput.value = `${date} ${time}`;

    // SHORT ALIASES for EmailJS subject (due to word limits)
    // Subject you chose: "New reservation — ${d} ${t} — ${n} (p ${sz})"
    const alias = {
      d: date,
      t: time,
      n: (data.get("user_name") || "").toString(),
      sz: (data.get("party_size") || "").toString(),
    };
    Object.entries(alias).forEach(([name, value]) => {
      const el = form.querySelector(`input[name="${name}"]`);
      if (el) el.value = value;
    });

    setStatus({ state: "loading", message: "Sending reservation..." });

    try {
      // 1) Send to restaurant inbox (admin template)
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_ADMIN, form, EMAILJS_PUBLIC_KEY);

      // 2) Optional: auto-reply to guest
      if (EMAILJS_TEMPLATE_ID_USER) {
        await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER, form, EMAILJS_PUBLIC_KEY);
      }

      setStatus({
        state: "success",
        message: "Reservation request sent! We'll email you shortly.",
      });
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus({ state: "error", message: "Failed to send. Please try again." });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <form ref={formRef} onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-6">
          <legend className="fieldset-legend">Reserve a Table</legend>

          {/* Contact */}
          <label className="label" htmlFor="user_name">
            Full Name
          </label>
          <input
            id="user_name"
            name="user_name"
            type="text"
            className="input input-bordered w-full"
            placeholder="Jane Doe"
            required
          />

          <label className="label" htmlFor="user_email">
            Email
          </label>
          <input
            id="user_email"
            name="user_email"
            type="email"
            className="input input-bordered w-full"
            placeholder="jane@example.com"
            required
          />

          <label className="label" htmlFor="phone">
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input input-bordered w-full"
            placeholder="+49 151 12345678"
            pattern="^\+?[0-9\s-]{7,15}$"
          />

          {/* Reservation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="reservation_date">
                Date
              </label>
              <input
                id="reservation_date"
                name="reservation_date"
                type="date"
                min={todayStr}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="reservation_time">
                Time
              </label>
              <input
                id="reservation_time"
                name="reservation_time"
                type="time"
                min={OPEN_TIME}
                max={CLOSE_TIME}
                step={300}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>

          <label className="label" htmlFor="party_size">
            Party Size
          </label>
          <input
            id="party_size"
            name="party_size"
            type="number"
            className="input input-bordered w-full"
            placeholder="2"
            min={1}
            max={20}
            required
          />

          <label className="label">Seating Preference</label>
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer flex items-center gap-2">
              <input type="radio" name="seating" value="Indoor" className="radio" defaultChecked />
              <span>Indoor</span>
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input type="radio" name="seating" value="Outdoor" className="radio" />
              <span>Outdoor</span>
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input type="radio" name="seating" value="No preference" className="radio" />
              <span>No preference</span>
            </label>
          </div>

          <label className="label" htmlFor="occasion">
            Occasion
          </label>
          <select id="occasion" name="occasion" className="select select-bordered w-full">
            <option>None</option>
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Business</option>
            <option>Other</option>
          </select>

          <label className="label" htmlFor="special_requests">
            Special Requests
          </label>
          <textarea
            id="special_requests"
            name="special_requests"
            className="textarea textarea-bordered w-full h-28"
            placeholder="Allergies, high chair, wheelchair access, etc."
          />

          {/* Consents */}
          <div className="flex items-center gap-2 mt-3">
            <input id="gdpr" name="gdpr" type="checkbox" className="checkbox" required />
            <label htmlFor="gdpr" className="label-text">
              I agree to the reservation terms and consent to my data being used to process this booking.
            </label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input id="newsletter" name="newsletter" type="checkbox" className="checkbox" />
            <label htmlFor="newsletter" className="label-text">
              Subscribe to our newsletter
            </label>
          </div>

          {/* Honeypot & derived values */}
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <input type="hidden" id="reservation_datetime_display" name="reservation_datetime_display" />

          {/* SHORT alias fields for EmailJS subject */}
          <input type="hidden" name="d" />
          <input type="hidden" name="t" />
          <input type="hidden" name="n" />
          <input type="hidden" name="sz" />

          <button className="btn btn-neutral mt-5" type="submit" disabled={status.state === "loading"}>
            {status.state === "loading" ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Request Booking"
            )}
          </button>

          {status.state !== "idle" && (
            <div
              className={`mt-3 text-sm ${
                status.state === "success"
                  ? "text-success"
                  : status.state === "error"
                  ? "text-error"
                  : "opacity-70"
              }`}
              role="status"
            >
              {status.message}
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}
