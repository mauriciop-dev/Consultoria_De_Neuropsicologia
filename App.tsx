
import React, { useState, useEffect } from 'react';
import { Patient } from './types';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import PatientWorkspace from './components/PatientWorkspace';
import AIChatPanel from './components/AIChatPanel';
import ReportsCenter from './components/ReportsCenter';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'new-patient' | 'workspace' | 'reports'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState('summary');

  // Load initial mockup data
  useEffect(() => {
    const mockup: Patient[] = [
      {
        id: '1',
        documentId: '102344566',
        name: 'Diego Pérez',
        age: 5,
        date: new Date().toISOString(),
        eps: 'Sura',
        schooling: 'Transición',
        motherName: 'Flor Marina',
        motherOccupation: 'Ingeniera',
        fatherName: 'Carlos Pérez',
        fatherOccupation: 'Contador',
        siblings: '1 hermana',
        laterality: 'Right',
        address: 'Calle 123 #45-67',
        livesWith: 'Padres',
        previousTests: 'Ninguna',
        consultationReason: 'Dificultad en el lenguaje y atención.',
        forgottenMemories: '',
        personalHistory: '',
        familyHistorySimilar: '',
        occupationalTherapy: false,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'Ninguno',
        familyHistory: '',
        bondingRelations: 'Buenas',
        prenatalHistory: 'Normal',
        plannedPregnancy: true,
        pregnancyRisks: 'Ninguno',
        pregnancyFactorRisks: 'Ninguno',
        pregnancyNumber: 1,
        birthPosition: 'Cefálico',
        apgarScore: '9/10',
        jaundice: false,
        frequentFlu: true,
        perinatalPeriod: 'Normal',
        weight: '3.2kg',
        motherAgeAtBirth: 28,
        psychomotorDevelopment: 'Normal',
        occupationalSkills: '',
        breastfeedingPeriod: '12 meses',
        sleepPatterns: 'Duerme bien',
        headControlAge: '3 meses',
        crawlingAge: '8 meses',
        sittingAge: '6 meses',
        walkingAge: '13 meses',
        eyeContact: 'Sí',
        attachment: 'Seguro',
        restless: true,
        attentionMemory: '',
        languageDevelopment: 'Retraso leve',
        firstWords: '18 meses',
        negativeReinforcements: '',
        sleepsAlone: true,
        swallowing: 'Normal',
        bottle: false,
        breast: true,
        parentingPatterns: 'Autoritativo',
        punishment: 'Tiempo fuera',
        reward: 'Elogios',
        followsInstructions: true,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: false,
        observations: ['El niño se muestra inquieto durante la entrevista inicial.'],
        diagnosisInitial: 'Posible retraso madurativo',
        selectedBatteries: ['motricity', 'language'],
        testResults: {},
        finalDiagnosis: '',
        suggestedTreatment: '',
        files: []
      }
    ];
    setPatients(mockup);
  }, []);

  const handleSavePatient = (newPatient: Partial<Patient>) => {
    const fullPatient = newPatient as Patient;
    setPatients(prev => [...prev, fullPatient]);
    setView('dashboard');
  };

  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setWorkspaceTab('summary');
    setView('workspace');
  };

  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    setCurrentPatient(updated);
  };

  const handleGoToReports = () => {
    if (currentPatient) {
      setWorkspaceTab('reports');
      setView('workspace');
    } else {
      setView('reports');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 cursor-pointer" onClick={() => setView('dashboard')}>
            <i className="fas fa-brain text-white text-xl"></i>
          </div>
          <div className="cursor-pointer" onClick={() => setView('dashboard')}>
            <h1 className="font-extrabold text-slate-800 tracking-tight">NeuroAI <span className="text-indigo-600">Clinic</span></h1>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Portal Profesional
            </div>
          </div>
        </div>
        
        <nav className="ml-12 hidden md:flex gap-6">
          <button 
            onClick={() => setView('dashboard')} 
            className={`text-sm font-semibold transition-colors ${view === 'dashboard' ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pacientes
          </button>
          <button 
            onClick={handleGoToReports}
            className={`text-sm font-semibold transition-colors ${(view === 'reports' || (view === 'workspace' && workspaceTab === 'reports')) ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Informes
          </button>
          <button className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Configuración</button>
        </nav>

        <div className="ml-auto flex items-center gap-4">
           <div className="hidden sm:block text-right">
             <p className="text-sm font-bold text-slate-800">Dra. Flor Marina</p>
             <p className="text-[10px] text-slate-400 font-medium">Neuropsicóloga Infantil</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/100" alt="Profile" />
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {view === 'dashboard' && (
          <Dashboard 
            patients={patients} 
            onSelectPatient={handleSelectPatient} 
            onNewPatient={() => setView('new-patient')}
          />
        )}

        {view === 'new-patient' && (
          <PatientForm onSave={handleSavePatient} onCancel={() => setView('dashboard')} />
        )}

        {view === 'workspace' && currentPatient && (
          <PatientWorkspace 
            patient={currentPatient} 
            onUpdate={handleUpdatePatient}
            onBack={() => setView('dashboard')}
            activeTab={workspaceTab}
            onTabChange={setWorkspaceTab}
          />
        )}

        {view === 'reports' && (
          <ReportsCenter 
            patients={patients} 
            onSelectPatient={handleSelectPatient} 
            onBack={() => setView('dashboard')}
          />
        )}
      </main>

      <AIChatPanel />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 p-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium tracking-wide">© 2024 NEUROAI CLINIC MVP. TECNOLOGÍA IA PARA LA SALUD MENTAL INFANTIL.</p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest">Soporte</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest">Privacidad</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-widest">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
