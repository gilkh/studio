
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ServiceOrOffer } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatItemForMessage(item: ServiceOrOffer, message: string): string {
  const isOffer = item.type === 'offer';
  const priceString = isOffer ? `**Price:** $${item.price}` : '**Price:** Custom Quote';
  
  const inquiryMessage = `## Inquiry About: ${item.title}\n\n**${item.category}** from **${item.vendorName}**\n${priceString}\n\n---\n\n> ${message}`;

  return inquiryMessage;
}
