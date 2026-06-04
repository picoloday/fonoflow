import React, { useState } from "react";
import { Smile, CheckCircle, Info, Star, Calendar, MessageSquare, ShieldCheck } from "lucide-react";
import { SERVICES_DATA } from "../data";

interface PediatricViewProps {
  onSelectServiceForBooking: (serviceId: string) => void;
  setView: (view: "servicios" | "contacto") => void;
}

export default function PediatricView({ onSelectServiceForBooking, setView }: PediatricViewProps) {
  const [activeMilestone, setActiveMilestone] = useState<number>(0);

  const pediatricServices = SERVICES_DATA.filter(s => s.category === "infantil");

  // Pediatric milestone guides
  const childMilestones = [
    {
      age: "18 - 24 Meses",
      title: "Puesta en marcha del habla",
      points: [
        "Usa al menos de 10 a 20 palabras con intención clara.",
        "Imita sonidos de animales, objetos cotidianos, canciones.",
        "Señala lo que quiere en lugar de únicamente llorar.",
        "Entiende instrucciones muy simples ('ven aquí', 'dame')"
      ]
    },
    {
      age: "2 Años",
      title: "La explosión del lenguaje",
      points: [
        "Une dos palabras ('agua no', 'quiero pan') de forma voluntaria.",
        "Posee un léxico activo de más de 50 palabras.",
        "Sigue órdenes de dos pasos ('coge el juguete y ponlo aquí').",
        "Empieza a responder a preguntas de '¿qué es esto?'"
      ]
    },
    {
      age: "3 Años",
      title: "Desarrollo de la estructura",
      points: [
        "El habla ya es inteligible para personas ajenas al hogar en el 70%.",
        "Construye oraciones simples de tres palabras (Sujeto + Verbo + Objeto).",
        "Usa pronombres básicos ('yo', 'tú', 'mi') correctamente.",
        "Entiende conceptos de 'grande' o 'pequeño'."
      ]
    },
    {
      age: "4 Años y más",
      title: "Articulación y fluidez",
      points: [
        "Pronuncia la gran mayoría de sonidos consonánticos (excepto la 'R' vibrante).",
        "Relata acontecimientos sencillos que le han sucedido en el patio/parque.",
        "Habla con soltura y fluye sin tirones o repeticiones silábicas constantes.",
        "Pregunta incansablemente el porqué de las cosas."
      ]
    }
  ];

  const myths = [
    {
      myth: "Ya hablará, cada niño tiene su ritmo.",
      fact: "Cada niño es diferente, pero existen hitos madurativos claros. Esperar en exceso consolida la dificultad y dificulta la lectoescritura futura escolar."
    },
    {
      myth: "Tiene dislexia porque escribe letras al revés con 5 años.",
      fact: "La rotación de letras es común de forma madurativa hasta los 6 o 7 años. No es dislexia en sí, pero sí es aconsejable reforzar la conciencia fonológica y visuoespacial."
    },
    {
      myth: "El chupete no influye en la dentadura ni en el habla.",
      fact: "El uso de chupete beyond 18-24 meses deforma el paladar, induce respiración bucal e impide que la lengua aprenda a colocarse correctamente para pronunciar la S, L, R."
    }
  ];

  return (
    <div className="space-y-12 py-4 animate-fade-in">
      
      {/* Visual Hero */}
      <section className="rounded-3xl bg-amber-50 border border-brand-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-12">
          <div className="md:col-span-7 space-y-5">
            <span className="text-xs font-bold text-orange-600 bg-orange-100/70 inline-block px-3 py-1.5 rounded-full uppercase tracking-wider">
              🍭 El juego como herramienta clínica
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Logopedia Infantil y Juvenil
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              En Kairos entendemos que un niño no es un adulto en miniatura. Las sesiones se estructuran como un espacio de juego guiado donde estimulamos las musculaturas de la cara, la fonación, el vocabulario y las destrezas de lectura de forma totalmente interactiva.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectServiceForBooking("ped-lenguaje")}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer"
              >
                Solicitar Cita de Diagnóstico Infantil
              </button>
            </div>
          </div>
          
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden aspect-square relative border border-brand-100 bg-white">
              <img
                src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=500&auto=format&fit=crop"
                alt="Niño jugando con un juguete de madera interactuando"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Developmental Milestones interactive component */}
      <section className="bg-white rounded-3xl border border-brand-100 p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight">
            ¿Cuáles son los hitos del lenguaje por edad?
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-medium">
            Pulsa en las pestañas para examinar qué hitos de comunicación debe tener afianzados tu menor según su edad y descubre cuándo es recomendable consultar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0">
            {childMilestones.map((ms, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveMilestone(i)}
                className={`flex-1 shrink-0 lg:shrink text-left p-3.5 rounded-xl border font-display transition-all cursor-pointer ${
                  activeMilestone === i
                    ? "border-brand-500 bg-brand-50 text-brand-900 font-bold"
                    : "border-neutral-200 hover:border-brand-100 hover:bg-neutral-50 text-neutral-600 font-semibold"
                }`}
              >
                <p className="text-xs text-brand-600">{ms.age}</p>
                <p className="text-xs sm:text-sm mt-0.5 mt-1 truncate">{ms.title}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 p-6 bg-brand-50 rounded-2xl border border-brand-100/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg">
                Hitos madurativos: {childMilestones[activeMilestone].age}
              </span>
              <h3 className="font-display font-bold text-lg text-neutral-900">
                {childMilestones[activeMilestone].title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {childMilestones[activeMilestone].points.map((pt, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-neutral-700 font-medium">
                    <span className="text-brand-500 text-sm mt-0.5">⭐</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed italic border-t border-brand-100 pt-3">
              💡 Si observas que tu hijo cumple la edad indicada y no realiza de forma habitual dos o más puntos, consúltanos. Una intervención precoz es determinante.
            </p>
          </div>

        </div>
      </section>

      {/* Services Sub-Listing Cards */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight text-center">
          ¿En qué áreas intervenimos?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pediatricServices.map(srv => (
            <div key={srv.id} className="p-6 bg-white rounded-2xl border border-brand-100 shadow-sm flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <span className="text-xl">⭐</span>
                <h3 className="font-display font-bold text-base text-neutral-900 leading-snug">{srv.title}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3">{srv.shortDesc}</p>
              </div>

              <button
                onClick={() => onSelectServiceForBooking(srv.id)}
                className="w-full py-2 bg-brand-50 hover:bg-brand-100 hover:text-brand-800 text-brand-700 text-xs font-bold rounded-xl tracking-wide transition-colors cursor-pointer text-center block"
              >
                Pedir cita para esta área
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pediatric Myths & Realities Column */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-extrabold text-orange-400 uppercase tracking-widest block">Mitos en Logopedia</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white">
            Desmitificando el Habla Infantil
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed font-semibold">
            Es muy común escuchar consejos caseros u opiniones populares que carecen de base terapéutica. Aquí respondemos con la realidad clínica.
          </p>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {myths.map((m, i) => (
            <div key={i} className="p-5 bg-neutral-800 rounded-2xl border border-neutral-700/50 space-y-2">
              <p className="text-xs text-orange-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                <span>❌ MITO:</span> &ldquo;{m.myth}&rdquo;
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
                <strong className="text-brand-400">✔️ REALIDAD:</strong> {m.fact}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* Bottom Booking reminder */}
      <section className="text-center space-y-4 py-4">
        <h3 className="font-display text-xl font-bold text-neutral-900">¿Quieres realizar una consulta preventiva?</h3>
        <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Estaremos encantados de resolver tus inquietudes con total cercanía. Agenda ahora tu evaluación inicial de forma cómoda.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onSelectServiceForBooking("ped-lenguaje")}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm tracking-wide cursor-pointer inline-flex items-center gap-2 transition-all shadow-md"
          >
            <Calendar className="h-4 w-4" />
            Agenda Diagnóstico Infantil
          </button>
        </div>
      </section>

    </div>
  );
}
