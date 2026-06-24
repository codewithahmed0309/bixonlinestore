import { WHATSAPP_NUMBER, CURRENCY } from "../config/store";
import { CartItem } from "../context/CartContext";
import { Product } from "../../api/api";

const buildUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const openWhatsApp = (message: string) => {
  window.open(buildUrl(message), "_blank", "noopener,noreferrer");
};

/* Single-product "Buy Now" message. */
export const buildProductMessage = (
  product: Product,
  quantity = 1
): string => {
  const lines = [
    "Hello,",
    "",
    "I would like to order:",
    "",
    `Product: ${product.name}`,
    `Price: ${CURRENCY}${product.price}`,
    `Quantity: ${quantity}`,
  ];

  if (product.image) {
    lines.push(`Image: ${product.image}`);
  }

  lines.push("", "Please confirm availability.");
  return lines.join("\n");
};

/* Full cart "Proceed" order summary. */
export const buildCartMessage = (
  items: CartItem[],
  grandTotal: number
): string => {
  const lines: string[] = [
    "Hello,",
    "",
    "I would like to place the following order:",
    "",
  ];

  items.forEach((item) => {
    lines.push(item.name);
    lines.push(`Qty: ${item.quantity}`);
    lines.push(`Price: ${CURRENCY}${item.price}`);
    lines.push(`Item Total: ${CURRENCY}${item.price * item.quantity}`);
    if (item.image) lines.push(`Image: ${item.image}`);
    lines.push("");
  });

  lines.push(`Grand Total: ${CURRENCY}${grandTotal}`);
  lines.push("", "Please confirm availability.");

  return lines.join("\n");
};
