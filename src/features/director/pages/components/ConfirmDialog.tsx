import React from "react";

type ConfirmDialogProps = {
  title: string;
  description: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  title,
  description,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-[min(520px,92vw)] rounded-2xl border border-gray-200/70 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-neutral-900">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <div className="mt-2 text-sm text-graphite/80">{description}</div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-ink hover:bg-black/5">Cancelar</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>
  );
}
