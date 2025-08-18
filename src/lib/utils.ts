
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ServiceOrOffer, ForwardedItem, QuoteRequest } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatItemForMessage(item: ServiceOrOffer, message: string, isQuote = false, quoteDetails: Partial<QuoteRequest> = {}): string {
  const forwardedItem: ForwardedItem = {
    isForwarded: true,
    isQuoteRequest: isQuote,
    title: item.title,
    image: item.image,
    vendorName: item.vendorName,
    price: item.type === 'offer' ? item.price : undefined,
    userMessage: message,
    itemId: item.id,
    itemType: item.type,
    eventDate: quoteDetails.eventDate,
    guestCount: quoteDetails.guestCount,
    phone: quoteDetails.phone,
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
