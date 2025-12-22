
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
}

const PatientWorkspace: React.FC<PatientWorkspaceProps> = ({ patient, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedBattery, setSelectedBattery] = useState(TEST_BATTERIES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObs, setNewObs] = useState('');
  const [patterns, setPatterns] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    const results = patient.testResults[batteryId];
    if (!battery || !results) return;

    const summary = await analyzeBatteryResult(battery.name, battery.tasks, results);
    const updatedResults = { ...patient.testResults };
    updatedResults[batteryId].aiSummary = summary;
    onUpdate({ ...patient, testResults: updatedResults });
  };

  const triggerPatternRecognition = async () => {
    setIsAnalyzing(true);
    const result = await findPatterns(patient.testResults, patient);
    setPatterns(result);
    setIsAnalyzing(false);
  };

  const addObservation = () => {
    if (newObs.trim()) {
      onUpdate({ ...patient, observations: [...patient.observations, newObs] });
      setNewObs('');
      setIsModalOpen(false);
    }
  };

  const generatePDF = (type: 'full' | 'battery' | 'final', targetBattery?: TestBattery) => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    const addText = (text: string, size = 12, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(splitText, margin, y);
      y += (splitText.length * (size * 0.5)) + 5;
      if (y > 280) { doc.addPage(); y = 20; }
    };

    const addTitle = (text: string) => {
      y += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
      addText(text.toUpperCase(), 14, true);
    };

    // Header
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('NeuroAI Clinic', margin, 20);
    doc.setFontSize(10);
    doc.text(`Informe Clínico: ${type === 'full' ? 'Historia Completa' : type === 'final' ? 'Cierre Clínico' : `Batería: ${targetBattery?.name}`}`, margin, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, 30);
    doc.setTextColor(0, 0, 0);
    y = 55;

    // Patient Data
    addTitle('Información del Paciente');
    addText(`Nombre: ${patient.name}`);
    addText(`ID: ${patient.documentId} | Edad: ${patient.age} años | Lateralidad: ${patient.laterality}`);
    addText(`EPS: ${patient.eps} | Escolaridad: ${patient.schooling}`);
    addText(`Motivo de Consulta: ${patient.consultationReason}`);

    if (type === 'full' || type === 'final') {
      addTitle('Resumen de Baterías Aplicadas');
      Object.keys(patient.testResults).forEach(key => {
        const b = TEST_BATTERIES.find(x => x.id === key);
        if (b) {
          addText(`- ${b.name}: ${patient.testResults[key].aiSummary || 'Sin resumen IA'}`);
        }
      });
    }

    if (type === 'battery' && targetBattery) {
      addTitle(`Resultados: ${targetBattery.name}`);
      const results = patient.testResults[targetBattery.id];
      targetBattery.tasks.forEach(task => {
        const score = results?.scores[task.id] || 0;
        const response = results?.responses[task.id] || 'N/A';
        addText(`${task.title}: ${score}/5`, 11, true);
        addText(`Respuesta: ${response}`, 10);
      });
      if (results?.aiSummary) {
        addTitle('Interpretación IA');
        addText(results.aiSummary.replace(/[#*]/g, ''), 10);
      }
    }

    if (type === 'full' || type === 'final') {
      addTitle('Análisis de Patrones y Conclusiones');
      if (patterns) addText(patterns.replace(/[#*]/g, ''), 10);
      addTitle('Diagnóstico Final');
      addText(patient.finalDiagnosis || 'Pendiente');
      addTitle('Tratamiento y Plan de Intervención');
      addText(patient.suggestedTreatment || 'Pendiente');
    }

    doc.save(`NeuroAI_Report_${patient.name.replace(/\s+/g, '_')}_${type}.pdf`);
  };

  const currentBattery = TEST_BATTERIES.find(b => b.id === selectedBattery)!;
  const currentResult = patient.testResults[selectedBattery] || { scores: {}, responses: {} };

  const chartData = currentBattery.tasks.map(t => ({
    subject: t.title,
    A: currentResult.scores[t.id] || 0,
    fullMark: 5,
  }));

  const renderMarkdown = (content: string) => {
    const html = marked.parse(content);
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
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'reports' ? 'INFORMES' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Diagnóstico y Motivo</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Motivo de Consulta</label>
                <p className="text-sm text-slate-700 mt-1">{patient.consultationReason || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Diagnóstico Inicial</label>
                <textarea 
                  className="w-full mt-2 p-3 border rounded-xl text-sm"
                  placeholder="Escriba el diagnóstico presuntivo..."
                  value={patient.diagnosisInitial}
                  onChange={(e) => onUpdate({...patient, diagnosisInitial: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Hitos del Desarrollo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Peso:</span> {patient.weight}</div>
              <div><span className="text-slate-400">Apgar:</span> {patient.apgarScore}</div>
              <div><span className="text-slate-400">Gateo:</span> {patient.crawlingAge}</div>
              <div><span className="text-slate-400">Locomoción:</span> {patient.walkingAge}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 space-y-2">
            {TEST_BATTERIES.map(b => (
              <button 
                key={b.id}
                onClick={() => setSelectedBattery(b.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedBattery === b.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'}`}
              >
                <div className="text-xs font-bold opacity-70 mb-1">BATERÍA {TEST_BATTERIES.indexOf(b) + 1}</div>
                <div className="font-bold text-sm leading-tight">{b.name}</div>
              </button>
            ))}
          </aside>

          <main className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
                  <div key={task.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700">{task.title}</h4>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(val => (
                          <button 
                            key={val}
                            onClick={() => handleScoreChange(selectedBattery, task.id, val)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${currentResult.scores[task.id] === val ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-400 hover:border-indigo-300'}`}
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
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        value={currentResult.responses[task.id] || ''}
                        onChange={(e) => handleResponseChange(selectedBattery, task.id, e.target.value)}
                      />
                    ) : task.options ? (
                      <div className="flex gap-2 flex-wrap">
                        {task.options.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => handleResponseChange(selectedBattery, task.id, opt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${currentResult.responses[task.id] === opt ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:border-slate-300'}`}
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
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
                  >
                    Generar Análisis
                  </button>
                </div>
                {currentResult.aiSummary ? (
                   <div 
                    className="bg-indigo-50/50 p-4 rounded-xl text-sm text-indigo-900 border border-indigo-100 leading-relaxed min-h-[60px] markdown-content"
                    dangerouslySetInnerHTML={renderMarkdown(currentResult.aiSummary)}
                  />
                ) : (
                  <div className="bg-indigo-50/50 p-4 rounded-xl text-sm text-indigo-900 italic border border-indigo-100 leading-relaxed min-h-[60px]">
                    Haga clic en 'Generar Análisis' para recibir una interpretación automática de estos resultados.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Reconocimiento de Patrones</h3>
              <p className="text-slate-500">La IA analiza correlaciones entre todas las pruebas aplicadas.</p>
            </div>
            <button 
              onClick={triggerPatternRecognition}
              disabled={isAnalyzing}
              className={`px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${isAnalyzing ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
            >
              {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-brain"></i>}
              {isAnalyzing ? 'Analizando...' : 'Identificar Patrones'}
            </button>
          </div>

          {!patterns && !isAnalyzing ? (
            <div className="text-center py-20 opacity-30">
              <i className="fas fa-puzzle-piece text-6xl mb-4"></i>
              <p className="text-lg">No hay análisis de patrones todavía</p>
            </div>
          ) : isAnalyzing ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none">
              <div 
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-serif text-lg markdown-content"
                dangerouslySetInnerHTML={renderMarkdown(patterns)}
              />
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-3">Diagnóstico Final</h4>
                  <textarea 
                    className="w-full p-4 border rounded-xl h-40"
                    placeholder="Escriba el diagnóstico definitivo..."
                    value={patient.finalDiagnosis}
                    onChange={(e) => onUpdate({...patient, finalDiagnosis: e.target.value})}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-3">Tratamiento Sugerido</h4>
                  <textarea 
                    className="w-full p-4 border rounded-xl h-40"
                    placeholder="Escriba el plan de intervención..."
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
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fas fa-file-medical text-indigo-600"></i>
              Centro de Informes y Exportación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Historia Completa */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-address-book"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Historia Completa</h4>
                <p className="text-sm text-slate-500 mb-6">Expediente integral incluyendo datos básicos, desarrollo, resultados y diagnóstico.</p>
                <button 
                  onClick={() => generatePDF('full')}
                  className="mt-auto w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-download"></i> Descargar PDF
                </button>
              </div>

              {/* Card 2: Cierre Clínico */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-file-signature"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Informe de Cierre</h4>
                <p className="text-sm text-slate-500 mb-6">Resumen de hallazgos, diagnóstico definitivo y plan de tratamiento sugerido.</p>
                <button 
                  onClick={() => generatePDF('final')}
                  className="mt-auto w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-download"></i> Descargar PDF
                </button>
              </div>

              {/* Card 3: Baterías Individuales */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-microscope"></i>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Pruebas Específicas</h4>
                <p className="text-sm text-slate-500 mb-6">Descarga informes técnicos detallados para cada una de las baterías aplicadas.</p>
                <div className="w-full space-y-2 mt-auto">
                  {TEST_BATTERIES.filter(b => patient.testResults[b.id]).map(b => (
                    <button 
                      key={b.id}
                      onClick={() => generatePDF('battery', b)}
                      className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:border-amber-400 hover:text-amber-700 transition-all flex items-center justify-center gap-2"
                    >
                      {b.name} <i className="fas fa-file-download opacity-40"></i>
                    </button>
                  ))}
                  {Object.keys(patient.testResults).length === 0 && <p className="text-[10px] text-slate-400 italic">No hay baterías aplicadas aún.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200">
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
              <div key={file.id} className="p-4 border rounded-xl text-center group relative hover:border-indigo-300">
                <i className={`fas ${file.type.includes('image') ? 'fa-file-image text-emerald-500' : 'fa-file-pdf text-red-500'} text-4xl mb-2`}></i>
                <p className="text-xs font-medium truncate mb-1">{file.name}</p>
                <p className="text-[10px] text-slate-400">{file.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Observaciones Clínicas</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 p-2 border rounded-lg bg-slate-50">
              {patient.observations.length > 0 ? patient.observations.map((o, i) => (
                <div key={i} className="text-sm p-3 bg-white rounded-lg border border-slate-100 shadow-sm">{o}</div>
              )) : <p className="text-sm text-slate-400 text-center py-4">No hay observaciones.</p>}
            </div>
            <textarea 
              className="w-full p-3 border rounded-xl text-sm mb-4"
              rows={3}
              placeholder="Nueva observación..."
              value={newObs}
              onChange={(e) => setNewObs(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">Cerrar</button>
              <button onClick={addObservation} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientWorkspace;
