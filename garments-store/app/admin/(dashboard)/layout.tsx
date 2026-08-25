import AdminNav from "@/components/admin/AdminNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row">
      <AdminNav />
      <div className="flex-1 px-5 py-8">{children}</div>
    </div>
  );
}
