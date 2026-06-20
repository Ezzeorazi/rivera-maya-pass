'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-coral text-white font-body font-bold rounded-xl px-5 py-2.5 text-sm hover:bg-coral/90 transition-colors"
    >
      📄 Guardar / Imprimir PDF
    </button>
  );
}
