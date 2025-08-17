
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ServiceOrOffer, ForwardedItem } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatItemForMessage(item: ServiceOrOffer, message: string): string {
  const forwardedItem: ForwardedItem = {
    isForwarded: true,
    title: item.title,
    image: item.image,
    vendorName: item.vendorName,
    price: item.type === 'offer' ? item.price : undefined,
    userMessage: message,
    itemId: item.id,
    itemType: item.type,
  };
  return JSON.stringify(forwardedItem);
}

export function parseForwardedMessage(text: string): ForwardedItem | null {
  try {
    const data = JSON.parse(text);
    if (data && data.isForwarded === true) {
      return data as ForwardedItem;
    }
    return null;
  } catch (e) {
    return null;
  }
}
