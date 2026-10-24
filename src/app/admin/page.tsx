import type { Metadata } from "next";
import AdminGate from "@/components/admin/AdminGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Control Room",
  robots: { index: false },
};

export default function AdminPage() {
  return <AdminGate />;
}
