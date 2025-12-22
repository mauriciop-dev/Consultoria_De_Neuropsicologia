
import React, { useState } from 'react';
import { Patient } from '../types';

interface ReportsCenterProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onBack: () => void;
}

const ReportsCenter: React.FC<ReportsCenterProps> = ({ patients, onSelectPatient, onBack }) => {
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.documentId.includes(search)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
          <i className="fas fa-file-medical"></i>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800">Centro de Informes</h2>
          <p className="text-slate-500 text-sm">Seleccione un paciente para generar y descargar informes clínicos.</p>
        </div>
        <button onClick={onBack} className="text-sm font-medium text-slate-400 hover:text-slate-600">
          Cerrar
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Buscar por nombre o documento..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map(patient => (
            <div 
              key={patient.id} 
              className="py-4 flex items-center justify-between hover:bg-slate-50 px-4 rounded-xl transition-colors cursor-pointer group"
              onClick={() => onSelectPatient(patient)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{patient.name}</h4>
                  <p className="text-xs text-slate-400">Documento: {patient.documentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">
                  {Object.keys(patient.testResults).length} Baterías
                </span>
                <i className="fas fa-chevron-right text-slate-300 group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic">
              No se encontraron pacientes que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
