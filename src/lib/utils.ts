import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function downloadCsv(url: string, filename: string) {
  const adminToken = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    headers: {
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}