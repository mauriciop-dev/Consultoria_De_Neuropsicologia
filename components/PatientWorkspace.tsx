
import React, { useState, useEffect } from 'react';
import { Patient, BatteryResult, TestBattery } from '../types';
import { TEST_BATTERIES } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { analyzeBatteryResult, findPatterns } from '../services/geminiService';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';

interface PatientWorkspaceProps {
  patient: Patient;
  onUpdate: (updated: Patient) => void;
  onBack: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const PatientWorkspace: React.FC<PatientWorkspaceProps> = ({ patient, onUpdate, onBack, activeTab, onTabChange }) => {
  const [selectedBattery, setSelectedBattery] = useState(TEST_BATTERIES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObs, setNewObs] = useState('');
  const [patterns, setPatterns] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingBatteryId, setAnalyzingBatteryId] = useState<string | null>(null);

  const handleScoreChange = (batteryId: string, taskId: string, score: number) => {
    const updatedResults = { ...patient.testResults };
    if (!updatedResults[batteryId]) {
      updatedResults[batteryId] = { scores: {}, responses: {} };
    }
    updatedResults[batteryId].scores[taskId] = score;
    onUpdate({ ...patient, testResults: updatedResults });
  };

  const handleResponseChange = (batteryId: string, taskId: string, responseText: string) => {
    const updatedResults = { ...patient.testResults };
    if (!updatedResults[batteryId]) {
      updatedResults[batteryId] = { scores: {}, responses: {} };
    }
    updatedResults[batteryId].responses[taskId] = responseText;
    onUpdate({ ...patient, testResults: updatedResults });
  };

  const triggerAIAnalysis = async (batteryId: string) => {
    const battery = TEST_BATTERIES.find(b => b.id === batteryId);
    if (!battery) return;

    // Obtenemos los resultados actuales o creamos unos vacíos para enviar a la IA
    const results = patient.testResults[batteryId] || { scores: {}, responses: {} };
    
    console.log(`Iniciando análisis IA para: ${battery.name}`, results);
    setAnalyzingBatteryId(batteryId);
    
    try {
      const summary = await analyzeBatteryResult(battery.name, battery.tasks, results);
      console.log("Resumen recibido de IA:", summary);
      
      const updatedResults = { ...patient.testResults };
      updatedResults[batteryId] = {
        ...results,
        aiSummary: summary
      };
      
      onUpdate({ ...patient, testResults: updatedResults });
    } catch (error) {
      console.error("Error crítico en triggerAIAnalysis:", error);
    } finally {
      setAnalyzingBatteryId(null);
    }
  };

  const triggerPatternRecognition = async () => {
    setIsAnalyzing(true);
    try {
      const result = await findPatterns(patient.testResults, patient);
      setPatterns(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addObservation = () => {
    if (newObs.trim()) {
      onUpdate({ ...patient, observations: [...patient.observations, newObs] });
      setNewObs('');
      setIsModalOpen(false);
    }
  };

  const generatePDF = (type: 'history' | 'battery' | 'final', targetBattery?: TestBattery) => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    const addText = (text: string, size = 11, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const splitText = doc.splitTextToSize(text || 'N/A', pageWidth - margin * 2);
      doc.text(splitText, margin, y);
      y += (splitText.length * (size * 0.5)) + 4;
      if (y > 275) { doc.addPage(); y = 20; }
    };

    const addTitle = (text: string) => {
      y += 6;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
      addText(text.toUpperCase(), 12, true);
    };

    const cleanMd = (text: string) => text ? text.replace(/[#*]/g, '').trim() : 'N/A';

    // Header Background
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('NeuroAI Clinic - Informe Profesional', margin, 18);
    doc.setFontSize(9);
    doc.text(`TIPO: ${type === 'history' ? 'HISTORIA COMPLETA' : type === 'final' ? 'INFORME FINAL DE CIERRE' : `RESULTADOS BATERÍA: ${targetBattery?.name}`}`, margin, 27);
    doc.text(`FECHA EMISIÓN: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 27);
    doc.setTextColor(0, 0, 0);
    y = 45;

    // SECTION 1: Patient Data (Common for all)
    addTitle('Información del Paciente');
    addText(`Nombre: ${patient.name}`, 11, true);
    addText(`Documento: ${patient.documentId} | Edad: ${patient.age} años | Lateralidad: ${patient.laterality}`);
    addText(`EPS: ${patient.eps} | Escolaridad: ${patient.schooling}`);
    addText(`Motivo de Consulta: ${patient.consultationReason}`);

    // LOGIC BY TYPE
    if (type === 'history') {
      addTitle('Resumen de Baterías Aplicadas');
      Object.keys(patient.testResults).forEach(key => {
        const b = TEST_BATTERIES.find(x => x.id === key);
        if (b) {
          addText(`${b.name}:`, 10, true);
          addText(cleanMd(patient.testResults[key].aiSummary || 'Pendiente de análisis IA.'), 10);
          y += 2;
        }
      });
      if (Object.keys(patient.testResults).length === 0) addText('No se han aplicado baterías aún.');

      addTitle('Diagnóstico Inicial');
      addText(patient.diagnosisInitial || 'Sin diagnóstico inicial registrado.');

      addTitle('Diagnóstico Final y Conclusiones');
      addText(patient.finalDiagnosis || 'Pendiente de evaluación final.');

      addTitle('Tratamiento y Plan Sugerido');
      addText(patient.suggestedTreatment || 'Pendiente de definir plan de intervención.');
    } 
    else if (type === 'battery' && targetBattery) {
      addTitle(`Detalle de Pruebas: ${targetBattery.name}`);
      const results = patient.testResults[targetBattery.id];
      if (results) {
        targetBattery.tasks.forEach(task => {
          const score = results.scores[task.id] || 0;
          const resp = results.responses[task.id] || 'N/A';
          addText(`- ${task.title}: ${score}/5`, 10, true);
          addText(`  Obs/Resp: ${resp}`, 9);
        });
        addTitle('Interpretación Clínica (IA)');
        addText(cleanMd(results.aiSummary || 'No hay análisis generado para esta batería.'), 10);
      } else {
        addText('Esta batería no ha sido aplicada a este paciente.');
      }
    } 
    else if (type === 'final') {
      addTitle('Hallazgos y Reconocimiento de Patrones');
      addText(cleanMd(patterns || 'No se ha ejecutado el análisis de patrones global.'), 10);

      addTitle('Resumen Consolidado de Pruebas');
      Object.keys(patient.testResults).forEach(key => {
        const b = TEST_BATTERIES.find(x => x.id === key);
        if (b) {
          addText(`${b.name}:`, 10, true);
          addText(cleanMd(patient.testResults[key].aiSummary || 'N/A'), 10);
          y += 2;
        }
      });

      addTitle('Veredicto Clínico Final');
      addText(patient.finalDiagnosis || 'Pendiente.', 11, true);

      addTitle('Recomendaciones de Tratamiento');
      addText(patient.suggestedTreatment || 'Pendiente.');
    }

    if (y > 240) { doc.addPage(); y = 40; } else { y += 20; }
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, margin + 60, y);
    y += 5;
    addText('Dr. Carl Jung', 10, true);
    addText('Neuropsicóloga Infantil', 9);

    doc.save(`NeuroAI_${type}_${patient.name.replace(/\s+/g, '_')}.pdf`);
  };

  const currentBattery = TEST_BATTERIES.find(b => b.id === selectedBattery)!;
  const currentResult = patient.testResults[selectedBattery] || { scores: {}, responses: {} };

  const chartData = currentBattery.tasks.map(t => ({
    subject: t.title,
    A: currentResult.scores[t.id] || 0,
    fullMark: 5,
  }));

  const renderMarkdown = (content: string) => {
    // Aseguramos que marked.parse devuelva un string síncrono
    const html = marked.parse(content) as string;
    return { __html: html };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg"><i className="fas fa-chevron-left"></i></button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800">{patient.name}</h2>
          <p className="text-xs text-slate-500">Expediente Clínico - {patient.documentId}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
          <i className="far fa-sticky-note mr-2"></i> Observaciones
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
        {['summary', 'tests', 'patterns', 'files', 'reports'].map(tab => (
          <button 
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'reports' ? 'INFORMES' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-notes-medical text-indigo-500"></i>
                Diagnóstico y Motivo
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Motivo de Consulta</label>
                  <p className="text-sm text-slate-700 mt-1 font-medium">{patient.consultationReason || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnóstico Inicial</label>
                  <textarea 
                    className="w-full mt-2 p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    rows={3}
                    placeholder="Escriba el diagnóstico presuntivo..."
                    value={patient.diagnosisInitial}
                    onChange={(e) => onUpdate({...patient, diagnosisInitial: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-baby text-indigo-500"></i>
                Hitos del Desarrollo
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Peso al Nacer</label>
                  <span className="font-semibold text-slate-700">{patient.weight || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Test de Apgar</label>
                  <span className="font-semibold text-slate-700">{patient.apgarScore || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Control Cefálico</label>
                  <span className="font-semibold text-slate-700">{patient.headControlAge || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gateo</label>
                  <span className="font-semibold text-slate-700">{patient.crawlingAge || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Locomoción (Camino)</label>
                  <span className="font-semibold text-slate-700">{patient.walkingAge || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Parto Planeado</label>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${patient.plannedPregnancy ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {patient.plannedPregnancy ? 'SÍ' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-users text-indigo-500"></i>
                Contexto Familiar
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Madre</label>
                    <p className="text-xs text-slate-700 mt-1 font-semibold">{patient.motherName || 'No registrado'}</p>
                    <p className="text-[10px] text-slate-500 italic">{patient.motherOccupation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Padre</label>
                    <p className="text-xs text-slate-700 mt-1 font-semibold">{patient.fatherName || 'No registrado'}</p>
                    <p className="text-[10px] text-slate-500 italic">{patient.fatherOccupation || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Vive con:</label>
                  <p className="text-sm text-slate-700 mt-1 font-medium">{patient.livesWith || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Hermanos:</label>
                  <p className="text-sm text-slate-700 mt-1 font-medium">{patient.siblings || 'Hijo único'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                <i className="fas fa-info-circle text-indigo-500"></i>
                Información Adicional
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">EPS / Aseguradora</label>
                  <span className="font-semibold text-slate-700">{patient.eps || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Escolaridad</label>
                  <span className="font-semibold text-slate-700">{patient.schooling || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lateralidad</label>
                  <span className="font-semibold text-slate-700">{patient.laterality === 'Right' ? 'Derecha' : patient.laterality === 'Left' ? 'Izquierda' : 'Ambidiestro'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha Registro</label>
                  <span className="font-semibold text-slate-700">{new Date(patient.date).toLocaleDateString()}</span>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dirección / Residencia</label>
                  <span className="font-semibold text-slate-700">{patient.address || 'No registrada'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <aside className="lg:w-64 space-y-2">
            {TEST_BATTERIES.map(b => (
              <button 
                key={b.id}
                onClick={() => setSelectedBattery(b.id)}
                disabled={analyzingBatteryId !== null}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedBattery === b.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'} ${analyzingBatteryId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-xs font-bold opacity-70 mb-1">BATERÍA {TEST_BATTERIES.indexOf(b) + 1}</div>
                <div className="font-bold text-sm leading-tight">{b.name}</div>
              </button>
            ))}
          </aside>

          <main className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative min-h-[500px]">
              {analyzingBatteryId === selectedBattery && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-2xl transition-all">
                  <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-indigo-700 font-bold text-lg">Procesando respuestas...</p>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">La IA está analizando los hallazgos clínicos</p>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{currentBattery.name}</h3>
                  <p className="text-slate-500 text-sm">{currentBattery.description}</p>
                </div>
                <div className="h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 10}} />
                      <Radar name="Puntaje" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                {currentBattery.tasks.map(task => (
                  <div key={task.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100/50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700">{task.title}</h4>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(val => (
                          <button 
                            key={val}
                            onClick={() => handleScoreChange(selectedBattery, task.id, val)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${currentResult.scores[task.id] === val ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-slate-400 hover:border-indigo-300'}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    {task.type === 'text' || task.type === 'count' ? (
                      <input 
                        type="text" 
                        placeholder="Registro de respuesta..."
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={currentResult.responses[task.id] || ''}
                        onChange={(e) => handleResponseChange(selectedBattery, task.id, e.target.value)}
                      />
                    ) : task.options ? (
                      <div className="flex gap-2 flex-wrap">
                        {task.options.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleResponseChange(selectedBattery, task.id, opt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${currentResult.responses[task.id] === opt ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 hover:border-slate-300'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-sparkles text-indigo-500"></i>
                    Resumen sugerido por IA
                  </h4>
                  <button 
                    onClick={() => triggerAIAnalysis(selectedBattery)}
                    disabled={analyzingBatteryId !== null}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${analyzingBatteryId ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-indigo-600 hover:bg-indigo-50 active:scale-95'}`}
                  >
                    {analyzingBatteryId === selectedBattery ? (
                      <><i className="fas fa-circle-notch fa-spin"></i> Generando...</>
                    ) : (
                      <><i className="fas fa-magic"></i> Analizar Batería</>
                    )}
                  </button>
                </div>
                {currentResult.aiSummary ? (
                   <div 
                    className="bg-indigo-50/50 p-6 rounded-2xl text-sm text-slate-700 border border-indigo-100 leading-relaxed min-h-[100px] markdown-content shadow-inner"
                    dangerouslySetInnerHTML={renderMarkdown(currentResult.aiSummary)}
                  />
                ) : (
                  <div className="bg-slate-50 p-8 rounded-2xl text-sm text-slate-400 italic border border-dashed border-slate-200 leading-relaxed min-h-[100px] flex items-center justify-center">
                    No se ha generado interpretación IA para esta prueba. Haga clic en el botón superior para procesar los datos.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Reconocimiento de Patrones Global</h3>
              <p className="text-slate-500">La IA analiza correlaciones de todas las pruebas para detectar síndromes o perfiles específicos.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={triggerPatternRecognition}
                disabled={isAnalyzing}
                className={`px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 hover:shadow-indigo-200'}`}
              >
                {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-brain"></i>}
                {isAnalyzing ? 'Correlacionando...' : 'Identificar Patrones'}
              </button>
              {isAnalyzing && (
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest animate-pulse">
                  Trabajando en el análisis de patrones...
                </span>
              )}
            </div>
          </div>

          {!patterns && !isAnalyzing ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <i className="fas fa-puzzle-piece text-5xl text-slate-200 mb-4"></i>
              <p className="text-slate-400 font-medium">Aplique al menos 2 baterías y presione el botón para ver patrones clínicos.</p>
            </div>
          ) : isAnalyzing ? (
            <div className="space-y-6">
              <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
              <p className="text-center text-xs text-indigo-400 animate-pulse uppercase font-bold tracking-widest mt-8">Consultando experto virtual y procesando resultados multi-dominio...</p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="prose prose-indigo max-w-none">
                <div 
                  className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-serif text-lg markdown-content shadow-inner"
                  dangerouslySetInnerHTML={renderMarkdown(patterns || '')}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-stamp text-indigo-600"></i>
                    Diagnóstico Definitivo
                  </h4>
                  <textarea 
                    className="w-full p-4 border rounded-2xl h-48 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="Escriba aquí el diagnóstico para el informe oficial..."
                    value={patient.finalDiagnosis}
                    onChange={(e) => onUpdate({...patient, finalDiagnosis: e.target.value})}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-clipboard-list text-indigo-600"></i>
                    Plan de Intervención
                  </h4>
                  <textarea 
                    className="w-full p-4 border rounded-2xl h-48 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    placeholder="Escriba las recomendaciones y tratamiento..."
                    value={patient.suggestedTreatment}
                    onChange={(e) => onUpdate({...patient, suggestedTreatment: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <i className="fas fa-file-export text-indigo-600"></i>
                  Generación de Documentos Oficiales
                </h3>
                <p className="text-slate-500">Exporte los resultados en formato PDF profesional para adjuntar a la historia clínica física o enviar a los padres.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full opacity-30 -mr-6 -mt-6 group-hover:scale-125 transition-transform"></div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-indigo-100">
                  <i className="fas fa-book-medical"></i>
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-3">Historia Completa</h4>
                <ul className="text-xs text-slate-500 space-y-2 mb-8 flex-1">
                  <li className="flex gap-2"><i className="fas fa-check text-indigo-500"></i> Datos demográficos</li>
                  <li className="flex gap-2"><i className="fas fa-check text-indigo-500"></i> Motivo de consulta</li>
                  <li className="flex gap-2"><i className="fas fa-check text-indigo-500"></i> Resumen de todas las pruebas</li>
                  <li className="flex gap-2"><i className="fas fa-check text-indigo-500"></i> Diagnóstico y Tratamiento</li>
                </ul>
                <button 
                  onClick={() => generatePDF('history')}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <i className="fas fa-file-download"></i> Descargar PDF
                </button>
              </div>

              <div className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full opacity-30 -mr-6 -mt-6 group-hover:scale-125 transition-transform"></div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-100">
                  <i className="fas fa-award"></i>
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-3">Informe de Cierre</h4>
                <ul className="text-xs text-slate-500 space-y-2 mb-8 flex-1">
                  <li className="flex gap-2"><i className="fas fa-check text-emerald-500"></i> Consolidado de hallazgos</li>
                  <li className="flex gap-2"><i className="fas fa-check text-emerald-500"></i> Análisis de patrones IA</li>
                  <li className="flex gap-2"><i className="fas fa-check text-emerald-500"></i> Juicio Clínico Definitivo</li>
                  <li className="flex gap-2"><i className="fas fa-check text-emerald-500"></i> Plan Terapéutico</li>
                </ul>
                <button 
                  onClick={() => generatePDF('final')}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <i className="fas fa-file-pdf"></i> Informe de Cierre
                </button>
              </div>

              <div className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50/50 transition-all flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-full opacity-30 -mr-6 -mt-6 group-hover:scale-125 transition-transform"></div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-amber-100">
                  <i className="fas fa-tasks"></i>
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-3">Pruebas Individuales</h4>
                <p className="text-xs text-slate-500 mb-6">Informes técnicos individuales por cada batería aplicada.</p>
                <div className="w-full space-y-2.5 overflow-y-auto max-h-[160px] pr-1">
                  {TEST_BATTERIES.filter(b => patient.testResults[b.id]).map(b => (
                    <button 
                      key={b.id}
                      onClick={() => generatePDF('battery', b)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-amber-50 hover:border-amber-400 transition-all flex items-center justify-between group/btn"
                    >
                      <span className="truncate mr-2">{b.name}</span>
                      <i className="fas fa-download opacity-0 group-hover/btn:opacity-100 text-amber-600 transition-opacity"></i>
                    </button>
                  ))}
                  {Object.keys(patient.testResults).length === 0 && (
                    <div className="text-center py-4 text-[10px] text-slate-400 italic">No hay resultados registrados.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Archivos Adjuntos</h3>
            <label className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-indigo-700 transition-colors">
              <i className="fas fa-upload mr-2"></i> Subir Archivo
              <input type="file" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const newFile = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: file.type,
                    url: URL.createObjectURL(file),
                    date: new Date().toLocaleDateString()
                  };
                  onUpdate({...patient, files: [...patient.files, newFile]});
                }
              }} />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {patient.files.map(file => (
              <div key={file.id} className="p-4 border rounded-xl text-center group relative hover:border-indigo-300 bg-slate-50">
                <i className={`fas ${file.type.includes('image') ? 'fa-file-image text-emerald-500' : 'fa-file-pdf text-red-500'} text-4xl mb-2`}></i>
                <p className="text-xs font-medium truncate mb-1">{file.name}</p>
                <p className="text-[10px] text-slate-400">{file.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <i className="fas fa-sticky-note text-amber-500"></i>
              Bitácora de Observaciones
            </h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto mb-6 p-4 border rounded-2xl bg-slate-50/50 shadow-inner">
              {patient.observations.length > 0 ? patient.observations.map((o, i) => (
                <div key={i} className="text-sm p-4 bg-white rounded-xl border border-slate-100 shadow-sm relative group">
                  <div className="absolute top-2 right-2 text-[10px] text-slate-300 font-bold">OBS #{i+1}</div>
                  {o}
                </div>
              )) : <p className="text-sm text-slate-400 text-center py-10">Inicie el registro de observaciones aquí.</p>}
            </div>
            <textarea 
              className="w-full p-4 border rounded-2xl text-sm mb-6 outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-white shadow-sm"
              rows={3}
              placeholder="Escriba una nueva observación clínica..."
              value={newObs}
              onChange={(e) => setNewObs(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors">Cancelar</button>
              <button onClick={addObservation} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-95">Guardar Nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientWorkspace;
