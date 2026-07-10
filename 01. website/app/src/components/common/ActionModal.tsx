import { HelpCircle, CheckCircle2, XCircle } from "lucide-react";

export type ActionModalVariant = "confirm" | "success" | "failed";

interface ActionModalProps {
  variant: ActionModalVariant;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const VARIANT_STYLES: Record<ActionModalVariant, { icon: typeof HelpCircle; bg: string; fg: string }> = {
  confirm: { icon: HelpCircle, bg: "bg-amber-100", fg: "text-amber-500" },
  success: { icon: CheckCircle2, bg: "bg-emerald-100", fg: "text-emerald-600" },
  failed: { icon: XCircle, bg: "bg-rose-100", fg: "text-rose-600" },
};

export default function ActionModal({ variant, title, message, loading, onConfirm, onCancel, onClose }: ActionModalProps) {
  const { icon: Icon, bg, fg } = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${fg}`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>

        {variant === "confirm" ? (
          <div className="flex border-t border-gray-100">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-5 py-3.5 text-sm font-bold text-white bg-[#5B5FC7] hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Please wait..." : "Yes"}
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full px-5 py-3.5 text-sm font-bold text-white bg-[#5B5FC7] hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
