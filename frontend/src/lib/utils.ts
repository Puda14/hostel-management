import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getMonthName(month: number): string {
  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];
  return months[month - 1] || "";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: "Trống",
    occupied: "Đang ở",
    maintenance: "Bảo trì",
    deposited: "Đã cọc",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-700 border-emerald-200",
    occupied: "bg-blue-100 text-blue-700 border-blue-200",
    maintenance: "bg-amber-100 text-amber-700 border-amber-200",
    deposited: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getUploadUrl(path: string | null): string {
  if (!path) return "";
  const base = process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:5000";
  return `${base}${path}`;
}

export function formatNumberWithDots(val: number | string): string {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "number" ? val : Number(String(val).replace(/\D/g, ""));
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function parseNumberFromDots(val: string): number {
  const clean = val.replace(/\./g, "").replace(/\D/g, "");
  return Number(clean) || 0;
}
