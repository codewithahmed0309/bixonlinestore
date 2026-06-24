export const STORE_NAME = "RAHI STORE";

/* Configurable WhatsApp number (international format, digits only, no + sign). */
export const WHATSAPP_NUMBER: string =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(
    /[^\d]/g,
    ""
  ) || "910000000000";

export const CURRENCY = "₹";
