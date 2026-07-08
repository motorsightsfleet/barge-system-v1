import { Link } from "react-router";
import { Construction } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface ComingSoonPageProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
  backPath: string;
  note?: string;
}

export default function ComingSoonPage({ title, breadcrumb, backPath, note }: ComingSoonPageProps) {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="text-sm text-gray-500">
        {breadcrumb.map((item, idx) => (
          <span key={item.label}>
            {idx > 0 && <span className="mx-1">&gt;</span>}
            {item.path ? (
              <Link to={item.path} className="hover:text-[#5B5FC7]">{item.label}</Link>
            ) : (
              <span className="text-[#5B5FC7] font-semibold">{item.label}</span>
            )}
          </span>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
          <Construction className="w-8 h-8 text-[#5B5FC7]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">This page is being built</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            {note ?? `${title} is under active development and will be available soon.`}
          </p>
        </div>
        <Link
          to={backPath}
          className="mt-2 px-6 py-2.5 bg-[#5B5FC7] hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
