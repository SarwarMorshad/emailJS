export const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
export const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
export const EMAILJS_TEMPLATE_ID_ADMIN =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN || import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // fallback
export const EMAILJS_TEMPLATE_ID_USER = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_USER || "";

if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_TEMPLATE_ID_ADMIN) {
  console.warn(
    "[EmailJS] Missing env vars. Ensure .env.local has VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_PUBLIC_KEY, and VITE_EMAILJS_TEMPLATE_ID_ADMIN"
  );
}
