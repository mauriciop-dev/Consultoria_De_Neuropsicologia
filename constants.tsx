
import { TestBattery } from './types';

export const TEST_BATTERIES: TestBattery[] = [
  {
    id: 'motricity',
    name: 'Motricidad y Coordinación',
    description: 'Habilidades motoras funcionales y coordinación ojo-mano.',
    tasks: [
      { id: 'm1', title: 'Motricidad Fina', description: 'Mira este dibujo de un círculo. ¿Podrías intentar dibujar uno igual?', type: 'drawing' },
      { id: 'm2', title: 'Motricidad Gruesa', description: 'Vamos a jugar: ¿Puedes saltar con los dos pies juntos tres veces?', type: 'choice', options: ['No logrado', 'Logrado con ayuda', 'Logrado'] },
      { id: 'm3', title: 'Coordinación Manual', description: 'Pon tus manos sobre la mesa y toca cada dedo con tu pulgar, uno por uno.', type: 'choice', options: ['No logrado', 'Lento/Impreciso', 'Logrado'] }
    ]
  },
  {
    id: 'language',
    name: 'Lenguaje y Comprensión',
    description: 'Expresión, denominación y seguimiento de instrucciones.',
    tasks: [
      { id: 'l1', title: 'Denominación', description: 'Mira esta imagen (manzana/mesa). ¿Cómo se llama esto?', type: 'text' },
      { id: 'l2', title: 'Comprensión', description: 'Toca primero tu nariz y después toca tus orejas.', type: 'choice', options: ['Incorrecto', 'Parcial', 'Correcto'] },
      { id: 'l3', title: 'Articulación', description: "Repite: 'Perro', 'Carro', 'Plátano'", type: 'text' }
    ]
  },
  {
    id: 'attention',
    name: 'Atención y Memoria',
    description: 'Selección de estímulos y almacenamiento a corto plazo.',
    tasks: [
      { id: 'a1', title: 'Atención Selectiva', description: 'Busca y toca todos los círculos rojos lo más rápido que puedas.', type: 'count' },
      { id: 'a2', title: 'Memoria Verbal', description: "Voy a decirte tres palabras: Gato, Árbol, Mesa. Ahora dímelas tú.", type: 'text' },
      { id: 'a3', title: 'Memoria Visual', description: 'Mira este dibujo... ¿puedes decirme qué viste?', type: 'text' }
    ]
  },
  {
    id: 'executive',
    name: 'Funciones Ejecutivas',
    description: 'Inhibición, planeación y flexibilidad mental.',
    tasks: [
      { id: 'e1', title: 'Inhibición', description: 'Sol = Aplaudir. Luna = Quieto.', type: 'choice', options: ['Falla', 'Duda', 'Correcto'] },
      { id: 'e2', title: 'Planeación', description: 'Historia: Semilla, Brote, Flor. ¿Cuál es el orden?', type: 'text' },
      { id: 'e3', title: 'Flexibilidad', description: 'Primero agrupamos por color, luego por forma.', type: 'choice', options: ['No cambia', 'Lento', 'Flexible'] }
    ]
  },
  {
    id: 'visuospatial',
    name: 'Visoespacial y Habilidades Académicas',
    description: 'Orientación espacial y requisitos académicos.',
    tasks: [
      { id: 'v1', title: 'Orientación Espacial', description: '¿El pajarito está arriba o abajo del árbol?', type: 'choice', options: ['Arriba', 'Abajo', 'No sabe'] },
      { id: 'v2', title: 'Noción de Cantidad', description: 'Cuenta estos bloques. ¿Cuántos hay?', type: 'count' },
      { id: 'v3', title: 'Identificación de Emociones', description: '¿Este niño está feliz, triste o enojado?', type: 'choice', options: ['Feliz', 'Triste', 'Enojado', 'Otro'] }
    ]
  }
];
