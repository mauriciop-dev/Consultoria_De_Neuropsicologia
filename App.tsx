
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

  // Load initial mockup data with 6 diverse clinical cases
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
        motherOccupation: 'Ingeniera de Sistemas',
        fatherName: 'Carlos Pérez',
        fatherOccupation: 'Contador Público',
        siblings: '1 hermana menor',
        laterality: 'Right',
        address: 'Calle 123 #45-67',
        livesWith: 'Ambos padres y abuela materna',
        previousTests: 'Ninguna',
        consultationReason: 'Dificultad marcada en el lenguaje expresivo y periodos cortos de atención en clase.',
        forgottenMemories: '',
        personalHistory: 'Parto por cesárea sin complicaciones.',
        familyHistorySimilar: 'Tío paterno con dislexia.',
        occupationalTherapy: false,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'Ninguno',
        familyHistory: '',
        bondingRelations: 'Buenas con la madre, distante con el padre por trabajo.',
        prenatalHistory: 'Embarazo controlado, sin amenazas de aborto.',
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
        sleepPatterns: 'Duerme bien 10 horas',
        headControlAge: '3 meses',
        crawlingAge: '8 meses',
        sittingAge: '6 meses',
        walkingAge: '13 meses',
        eyeContact: 'Sí',
        attachment: 'Seguro',
        restless: true,
        attentionMemory: '',
        languageDevelopment: 'Retraso leve en fonética',
        firstWords: '18 meses',
        negativeReinforcements: '',
        sleepsAlone: true,
        swallowing: 'Normal',
        bottle: false,
        breast: true,
        parentingPatterns: 'Autoritativo',
        punishment: 'Tiempo fuera',
        reward: 'Elogios y pegatinas',
        followsInstructions: true,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: false,
        observations: ['El niño se muestra inquieto durante la entrevista inicial.'],
        diagnosisInitial: 'Posible retraso madurativo del lenguaje y TDAH tipo predominio inquietud.',
        selectedBatteries: ['motricity', 'language'],
        testResults: {},
        finalDiagnosis: '',
        suggestedTreatment: '',
        files: []
      },
      {
        id: '2',
        documentId: '1098765432',
        name: 'Valentina Rodríguez',
        age: 7,
        date: new Date().toISOString(),
        eps: 'Sanitas',
        schooling: 'Segundo Grado',
        motherName: 'Elena Martínez',
        motherOccupation: 'Docente',
        fatherName: 'Roberto Rodríguez',
        fatherOccupation: 'Arquitecto',
        siblings: 'Hija única',
        laterality: 'Left',
        address: 'Carrera 7 #127-10',
        livesWith: 'Madre y Padrastro',
        previousTests: 'Tamizaje visual normal.',
        consultationReason: 'Bajo rendimiento escolar, dificultad para seguir instrucciones complejas y lectura lenta.',
        forgottenMemories: '',
        personalHistory: 'Parto natural, 39 semanas.',
        familyHistorySimilar: 'Padre con antecedentes de dificultades de aprendizaje.',
        occupationalTherapy: true,
        otSessions: 12,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'Audiometría normal',
        familyHistory: 'Padres divorciados hace 2 años.',
        bondingRelations: 'Conflictiva con el padre biológico.',
        prenatalHistory: 'Normal',
        plannedPregnancy: true,
        pregnancyRisks: 'Ninguno',
        pregnancyFactorRisks: 'Estrés laboral materno alto.',
        pregnancyNumber: 1,
        birthPosition: 'Cefálico',
        apgarScore: '8/10',
        jaundice: true,
        frequentFlu: false,
        perinatalPeriod: 'Fototerapia por 2 días.',
        weight: '2.9kg',
        motherAgeAtBirth: 32,
        psychomotorDevelopment: 'Normal',
        occupationalSkills: 'Dificultad en pinza fina.',
        breastfeedingPeriod: '6 meses',
        sleepPatterns: 'Terrores nocturnos ocasionales.',
        headControlAge: '4 meses',
        crawlingAge: '10 meses',
        sittingAge: '7 meses',
        walkingAge: '15 meses',
        eyeContact: 'Sí',
        attachment: 'Ansioso',
        restless: false,
        attentionMemory: 'Baja memoria de trabajo.',
        languageDevelopment: 'Normal',
        firstWords: '12 meses',
        negativeReinforcements: '',
        sleepsAlone: false,
        swallowing: 'Normal',
        bottle: true,
        breast: true,
        parentingPatterns: 'Permisivo',
        punishment: 'Quitar tablet',
        reward: 'Dulces',
        followsInstructions: false,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: true,
        observations: ['Se distrae con estímulos auditivos externos.'],
        diagnosisInitial: 'Sospecha de Dislexia y Trastorno de Procesamiento Sensorial.',
        selectedBatteries: ['attention', 'visuospatial'],
        testResults: {},
        finalDiagnosis: '',
        suggestedTreatment: '',
        files: []
      },
      {
        id: '3',
        documentId: '1045231098',
        name: 'Mateo Sánchez',
        age: 4,
        date: new Date().toISOString(),
        eps: 'Compensar',
        schooling: 'Pre-jardín',
        motherName: 'Claudia Restrepo',
        motherOccupation: 'Vendedora',
        fatherName: 'Desconocido',
        fatherOccupation: 'N/A',
        siblings: '2 hermanos mayores',
        laterality: 'Right',
        address: 'Barrio El Tunal',
        livesWith: 'Madre y hermanos',
        previousTests: 'Valoración por neuropediatría.',
        consultationReason: 'Ausencia de lenguaje oral, poco contacto visual y conductas repetitivas.',
        forgottenMemories: '',
        personalHistory: 'Nacido a las 36 semanas, bajo peso.',
        familyHistorySimilar: 'Primo con autismo.',
        occupationalTherapy: false,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'Pendiente RM cerebral',
        familyHistory: 'Madre cabeza de familia.',
        bondingRelations: 'Estrecha con el hermano mayor.',
        prenatalHistory: 'Preeclampsia leve.',
        plannedPregnancy: false,
        pregnancyRisks: 'Amenaza de parto pretérmino.',
        pregnancyFactorRisks: 'Consumo de cigarrillo ocasional (1er trimestre).',
        pregnancyNumber: 3,
        birthPosition: 'Podálico',
        apgarScore: '7/10',
        jaundice: false,
        frequentFlu: true,
        perinatalPeriod: 'UCI neonatal por 5 días.',
        weight: '2.1kg',
        motherAgeAtBirth: 19,
        psychomotorDevelopment: 'Retraso global.',
        occupationalSkills: 'Aleteo de manos frecuente.',
        breastfeedingPeriod: '3 meses',
        sleepPatterns: 'Insomnio de conciliación.',
        headControlAge: '6 meses',
        crawlingAge: 'No gateó',
        sittingAge: '9 meses',
        walkingAge: '20 meses',
        eyeContact: 'Escaso',
        attachment: 'Evitativo',
        restless: true,
        attentionMemory: 'Focalizada en objetos de interés.',
        languageDevelopment: 'Nulo',
        firstWords: 'No refiere',
        negativeReinforcements: '',
        sleepsAlone: false,
        swallowing: 'Selectividad alimentaria',
        bottle: true,
        breast: false,
        parentingPatterns: 'Inconsistente',
        punishment: 'Gritos',
        reward: 'Celular',
        followsInstructions: false,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: false,
        observations: ['No responde al llamado por su nombre.'],
        diagnosisInitial: 'Trastorno del Espectro Autista (Nivel 2) y Retraso Global del Desarrollo.',
        selectedBatteries: ['language', 'visuospatial'],
        testResults: {},
        finalDiagnosis: '',
        suggestedTreatment: '',
        files: []
      },
      {
        id: '4',
        documentId: '1011223344',
        name: 'Lucía Gómez',
        age: 6,
        date: new Date().toISOString(),
        eps: 'Salud Total',
        schooling: 'Primero',
        motherName: 'Patricia Sosa',
        motherOccupation: 'Enfermera',
        fatherName: 'Andrés Gómez',
        fatherOccupation: 'Policía',
        siblings: '1 hermano menor',
        laterality: 'Ambidextrous',
        address: 'Fontibón Centro',
        livesWith: 'Padres y hermano',
        previousTests: 'Ninguna',
        consultationReason: 'Extrema timidez, mutismo selectivo en el colegio y ansiedad de separación.',
        forgottenMemories: '',
        personalHistory: 'Embarazo y parto normales.',
        familyHistorySimilar: 'Madre con trastorno de ansiedad.',
        occupationalTherapy: false,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'Ninguno',
        familyHistory: 'Ambiente familiar rígido.',
        bondingRelations: 'Dependencia afectiva con la madre.',
        prenatalHistory: 'Normal',
        plannedPregnancy: true,
        pregnancyRisks: 'Ninguno',
        pregnancyFactorRisks: 'Ninguno',
        pregnancyNumber: 1,
        birthPosition: 'Cefálico',
        apgarScore: '9/10',
        jaundice: false,
        frequentFlu: false,
        perinatalPeriod: 'Normal',
        weight: '3.4kg',
        motherAgeAtBirth: 25,
        psychomotorDevelopment: 'Normal',
        occupationalSkills: 'Excelente dibujo.',
        breastfeedingPeriod: '18 meses',
        sleepPatterns: 'Pesadillas frecuentes.',
        headControlAge: '3 meses',
        crawlingAge: '9 meses',
        sittingAge: '6 meses',
        walkingAge: '12 meses',
        eyeContact: 'Sí (solo familiares)',
        attachment: 'Seguro-Ambivalente',
        restless: false,
        attentionMemory: 'Normal',
        languageDevelopment: 'Normal en casa, nulo fuera.',
        firstWords: '10 meses',
        negativeReinforcements: '',
        sleepsAlone: false,
        swallowing: 'Normal',
        bottle: false,
        breast: true,
        parentingPatterns: 'Sobreprotector',
        punishment: 'Retiro de afecto',
        reward: 'Tiempo juntos',
        followsInstructions: true,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: true,
        observations: ['No habla durante la sesión, se comunica por gestos.'],
        diagnosisInitial: 'Mutismo Selectivo y Trastorno de Ansiedad de Separación.',
        selectedBatteries: ['language', 'executive'],
        testResults: {},
        finalDiagnosis: '',
        suggestedTreatment: '',
        files: []
      },
      {
        id: '5',
        documentId: '1055667788',
        name: 'Santiago Castro',
        age: 8,
        date: new Date().toISOString(),
        eps: 'Famisanar',
        schooling: 'Tercer Grado',
        motherName: 'Marta Linares',
        motherOccupation: 'Chef',
        fatherName: 'Jorge Castro',
        fatherOccupation: 'Conductor',
        siblings: 'No tiene',
        laterality: 'Right',
        address: 'Suba, Compartir',
        livesWith: 'Abuelos maternos',
        previousTests: 'Ninguna',
        consultationReason: 'Agresividad impulsiva, baja tolerancia a la frustración y desobediencia.',
        forgottenMemories: '',
        personalHistory: 'Uso de fórceps durante el parto.',
        familyHistorySimilar: 'Padre con historial de problemas de conducta.',
        occupationalTherapy: false,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'EEG normal',
        familyHistory: 'Padres ausentes por trabajo.',
        bondingRelations: 'Conflictiva con figuras de autoridad.',
        prenatalHistory: 'Normal',
        plannedPregnancy: true,
        pregnancyRisks: 'Ninguno',
        pregnancyFactorRisks: 'Tabaquismo pasivo.',
        pregnancyNumber: 1,
        birthPosition: 'Cefálico',
        apgarScore: '8/10',
        jaundice: false,
        frequentFlu: true,
        perinatalPeriod: 'Normal',
        weight: '3.6kg',
        motherAgeAtBirth: 22,
        psychomotorDevelopment: 'Precoz en motricidad gruesa.',
        occupationalSkills: 'Destreza en deportes.',
        breastfeedingPeriod: '4 meses',
        sleepPatterns: 'Duerme poco, 6-7 horas.',
        headControlAge: '2 meses',
        crawlingAge: '7 meses',
        sittingAge: '5 meses',
        walkingAge: '10 meses',
        eyeContact: 'Desafiante',
        attachment: 'Desorganizado',
        restless: true,
        attentionMemory: 'Dificultad en atención sostenida.',
        languageDevelopment: 'Normal',
        firstWords: '9 meses',
        negativeReinforcements: 'Castigo físico ocasional.',
        sleepsAlone: true,
        swallowing: 'Normal',
        bottle: true,
        breast: true,
        parentingPatterns: 'Autoritario',
        punishment: 'Corregazos',
        reward: 'Dinero',
        followsInstructions: false,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: true,
        observations: ['Se muestra desafiante ante las consignas de evaluación.'],
        diagnosisInitial: 'Trastorno Oposicionista Desafiante y posible TDAH tipo impulsivo.',
        selectedBatteries: ['executive', 'attention'],
        testResults: {},
        finalDiagnosis: '',
        suggestedTreatment: '',
        files: []
      },
      {
        id: '6',
        documentId: '1022334455',
        name: 'Sara Buendía',
        age: 5,
        date: new Date().toISOString(),
        eps: 'Aliansalud',
        schooling: 'Jardín',
        motherName: 'Lorena Ruiz',
        motherOccupation: 'Abogada',
        fatherName: 'Mauricio Buendía',
        fatherOccupation: 'Periodista',
        siblings: 'Gemela con un hermano',
        laterality: 'Right',
        address: 'Usaquén',
        livesWith: 'Padres y hermano gemelo',
        previousTests: 'Evaluación de audición.',
        consultationReason: 'Retraso fonológico severo comparado con su hermano gemelo, timidez extrema.',
        forgottenMemories: '',
        personalHistory: 'Nacimiento gemelar, 37 semanas.',
        familyHistorySimilar: 'Ninguno',
        occupationalTherapy: false,
        pharmacologicalTreatment: 'Ninguno',
        complementaryExams: 'Pendiente potenciales evocados',
        familyHistory: 'Relación competitiva con su hermano.',
        bondingRelations: 'Dependencia del hermano para comunicarse.',
        prenatalHistory: 'Embarazo gemelar de alto riesgo.',
        plannedPregnancy: true,
        pregnancyRisks: 'Amenaza de parto prematuro.',
        pregnancyFactorRisks: 'Reposo absoluto último trimestre.',
        pregnancyNumber: 2,
        birthPosition: 'Cesárea programada',
        apgarScore: '9/10',
        jaundice: false,
        frequentFlu: true,
        perinatalPeriod: 'Normal',
        weight: '2.5kg',
        motherAgeAtBirth: 35,
        psychomotorDevelopment: 'Normal',
        occupationalSkills: 'Habilidades artísticas notables.',
        breastfeedingPeriod: '8 meses',
        sleepPatterns: 'Normal',
        headControlAge: '3 meses',
        crawlingAge: '9 meses',
        sittingAge: '7 meses',
        walkingAge: '14 meses',
        eyeContact: 'Sí',
        attachment: 'Seguro',
        restless: false,
        attentionMemory: 'Excelente memoria visual.',
        languageDevelopment: 'Retraso fonológico.',
        firstWords: '24 meses',
        negativeReinforcements: '',
        sleepsAlone: true,
        swallowing: 'Normal',
        bottle: false,
        breast: true,
        parentingPatterns: 'Autoritativo-Democrático',
        punishment: 'Reflexión',
        reward: 'Salidas al parque',
        followsInstructions: true,
        grossMotorWalk: true,
        grossMotorRun: true,
        grossMotorSkip: true,
        observations: ['Se frustra cuando no se le entiende lo que dice.'],
        diagnosisInitial: 'Trastorno de los Sonidos del Habla (TSH) y posible Disfasia.',
        selectedBatteries: ['language', 'motricity'],
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
          <p className="text-xs text-slate-400 font-medium tracking-wide">© 2025 NEUROAI CLINIC MVP. TECNOLOGÍA IA PARA LA SALUD MENTAL INFANTIL - PRODIG - Mauricio Pineda</p>
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
