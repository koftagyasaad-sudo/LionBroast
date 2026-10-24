"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AdminCustomer, AdminOrder } from "@/lib/admin-types";

const stamp = () => new Date().toISOString().slice(0, 10);

/* ------------------------------ Excel -------------------------------- */
export function exportCustomersXlsx(customers: AdminCustomer[]) {
  const rows = customers.map((c) => ({
    "Customer Code": c.customerCode,
    Name: c.name,
    "Primary Phone": c.primaryPhone,
    "Secondary Phone": c.secondaryPhone ?? "",
    Zone: c.zone ? c.zone.nameEn : "Out of range",
    Address: [c.street, c.building, c.flat, c.landmark].filter(Boolean).join(", "),
    Orders: c.ordersCount,
    "LTV (EGP)": c.ltv,
    Joined: c.createdAt.slice(0, 10),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] ?? { a: 1 }).map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  XLSX.writeFile(wb, `broast-asad-customers-${stamp()}.xlsx`);
}

export function exportOrdersXlsx(orders: AdminOrder[]) {
  const rows = orders.map((o) => ({
    "Order No": o.orderNumber,
    Status: o.status,
    Customer: o.customerName,
    Phone: o.primaryPhone,
    Zone: o.deliveryZone,
    Items: o.items.reduce((a, i) => a + i.qty, 0),
    Subtotal: o.subtotal,
    Delivery: o.deliveryFee,
    "Total (EGP)": o.total,
    Date: o.createdAt.slice(0, 16).replace("T", " "),
    Notes: o.notes ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] ?? { a: 1 }).map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, `broast-asad-orders-${stamp()}.xlsx`);
}

/* ------------------------------ PDF ---------------------------------- */
function brandedDoc(title: string) {
  const doc = new jsPDF();
  doc.setFillColor(15, 17, 21);
  doc.rect(0, 0, 210, 26, "F");
  doc.setTextColor(255, 102, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BROAST EL-ASSAD", 14, 11);
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(10);
  doc.text(title, 14, 19);
  doc.setTextColor(120);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, 196, 19, { align: "right" });
  return doc;
}

export function exportCustomersPdf(customers: AdminCustomer[]) {
  const doc = brandedDoc("Customers Hub Export");
  autoTable(doc, {
    startY: 32,
    head: [["Code", "Name", "Phone 1", "Phone 2", "Zone", "Orders", "LTV (EGP)", "Joined"]],
    body: customers.map((c) => [
      c.customerCode,
      /[^\x00-\x7F]/.test(c.name) ? c.primaryPhone : c.name, // Arabic glyphs unsupported by core fonts -> fall back to phone
      c.primaryPhone,
      c.secondaryPhone ?? "-",
      c.zone ? c.zone.nameEn : "Out of range",
      String(c.ordersCount),
      String(c.ltv),
      c.createdAt.slice(0, 10),
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 249] },
  });
  doc.save(`broast-asad-customers-${stamp()}.pdf`);
}

export function exportOrdersPdf(orders: AdminOrder[]) {
  const doc = brandedDoc("Orders Archive Export");
  autoTable(doc, {
    startY: 32,
    head: [["Order No", "Status", "Phone", "Zone", "Qty", "Total (EGP)", "Date"]],
    body: orders.map((o) => [
      o.orderNumber,
      o.status,
      o.primaryPhone,
      /[^\x00-\x7F]/.test(o.deliveryZone) ? "-" : o.deliveryZone,
      String(o.items.reduce((a, i) => a + i.qty, 0)),
      String(o.total),
      o.createdAt.slice(0, 16).replace("T", " "),
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 249] },
  });
  const total = Math.round(orders.filter((o) => o.status !== "CANCELLED").reduce((a, o) => a + o.total, 0));
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12);
  doc.text(`Revenue total: EGP ${total.toLocaleString("en-US")}`, 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10);
  doc.save(`broast-asad-orders-${stamp()}.pdf`);
}
