
import React, { useState } from 'react';
import { Patient } from '../types';

interface PatientFormProps {
  onSave: (patient: Partial<Patient>) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    documentId: '',
    age: 0,
    eps: '',
    schooling: '',
    laterality: 'Right',
    plannedPregnancy: false,
    jaundice: false,
    frequentFlu: false,
    occupationalTherapy: false,
    sleepsAlone: true,
    followsInstructions: true,
    observations: [],
    files: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <i className="fas fa-user-plus text-indigo-600"></i>
        Registro de Nuevo Paciente
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Data */}
        <section>
          <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Datos Básicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input required name="name" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Documento ID</label>
              <input required name="documentId" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Edad</label>
              <input required name="age" type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">EPS</label>
              <input name="eps" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escolaridad</label>
              <input name="schooling" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lateralidad</label>
              <select name="laterality" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" onChange={handleChange}>
                <option value="Right">Derecha</option>
                <option value="Left">Izquierda</option>
                <option value="Ambidextrous">Ambidiestro</option>
              </select>
            </div>
          </div>
        </section>

        {/* Family Context */}
        <section>
          <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Contexto Familiar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Madre / Ocupación</label>
              <div className="flex gap-2">
                <input name="motherName" placeholder="Nombre" className="w-1/2 px-3 py-2 border rounded-lg" onChange={handleChange} />
                <input name="motherOccupation" placeholder="Ocupación" className="w-1/2 px-3 py-2 border rounded-lg" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Padre / Ocupación</label>
              <div className="flex gap-2">
                <input name="fatherName" placeholder="Nombre" className="w-1/2 px-3 py-2 border rounded-lg" onChange={handleChange} />
                <input name="fatherOccupation" placeholder="Ocupación" className="w-1/2 px-3 py-2 border rounded-lg" onChange={handleChange} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Vive con:</label>
              <input name="livesWith" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Prenatal and Birth History */}
        <section>
          <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Historia Prenatal y Desarrollo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="plannedPregnancy" id="planned" onChange={handleChange} />
              <label htmlFor="planned" className="text-sm font-medium">¿Planeado?</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Peso al nacer</label>
              <input name="weight" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Test de Apgar</label>
              <input name="apgarScore" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Control Cefálico (edad)</label>
              <input name="headControlAge" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gateo (edad)</label>
              <input name="crawlingAge" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Camino (edad)</label>
              <input name="walkingAge" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Consultation Reason */}
        <section>
          <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-50 pb-1">Motivo de Consulta</h3>
          <textarea name="consultationReason" rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Escriba aquí..." onChange={handleChange}></textarea>
        </section>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
          <button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Guardar Paciente</button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
