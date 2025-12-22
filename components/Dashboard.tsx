
import React, { useState } from 'react';
import { Patient } from '../types';

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onNewPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.documentId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-500">Gestión de pacientes y diagnósticos</p>
        </div>
        <button 
          onClick={onNewPatient}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <i className="fas fa-plus"></i>
          Nuevo Paciente
        </button>
      </div>

      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input 
          type="text" 
          placeholder="Buscar por nombre o documento..." 
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(patient => (
          <div 
            key={patient.id} 
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onSelectPatient(patient)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full opacity-50 -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 line-clamp-1">{patient.name}</h3>
                <p className="text-xs text-slate-500">ID: {patient.documentId}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <i className="far fa-calendar-alt w-4"></i>
                <span>{patient.age} años</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-hospital w-4"></i>
                <span>{patient.eps || 'No registrada'}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-tasks w-4"></i>
                <span>{patient.selectedBatteries.length} baterías aplicadas</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-medium text-indigo-600">
              <span>VER EXPEDIENTE</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <i className="fas fa-user-friends text-4xl text-slate-200 mb-4"></i>
            <p className="text-slate-400 font-medium">No se encontraron pacientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
