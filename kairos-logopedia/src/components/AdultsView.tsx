import React, { useState } from "react";
import { Smile, CheckCircle, Info, Calendar, Heart, ShieldAlert, HeartHandshake } from "lucide-react";
import { SERVICES_DATA } from "../data";

interface AdultsViewProps {
  onSelectServiceForBooking: (serviceId: string) => void;
  setView: (view: "servicios" | "contacto") => void;
}

export default function AdultsView({ onSelectServiceForBooking, setView }: AdultsViewProps) {
  const adultServices = SERVICES_DATA.filter(s => s.category === "adulto");

  const voiceCareTips = [
    { title: "Mantén una hidratación óptima", desc: "Las cuerdas vocales necesitan lubricación para vibrar de forma fluida. Bebe de 1.5 a 2 litros de agua diarios, evitando el exceso de cafeína o alcohol que resecan la laringe." },
    { title: "Evita carraspear o toser habitualmente", desc: "Carraspear provoca un choque violento entre las cuerdas vocales, inflamando los tejidos. En su lugar, traga saliva con fuerza o bebe un sorbo pequeño de agua tibia." },
    { title: "Reposo vocal estructurado", desc: "Si tu voz es tu instrumento de trabajo (profesores, cantantes, atención al cliente), planifica silencios de 10 a 15 minutos dos o tres veces al día para permitir que los músculos laríngeos descansen." },
    { title: "Ejercicios de calentamiento de voz", desc: "Al igual que preparas tus piernas para correr, tu laringe necesita estiramientos. Ejercicios sencillos con sonidos labiales vibrantes ('BRRR') o tubos de resonancia semiocluida evitan fatiga vocal." }
  ];

  return (
    <div className="space-y-12 py-4 animate-fade-in">
      
      {/* Visual Hero block */}
      <section className="rounded-3xl bg-teal-50 border border-brand-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-12">
          <div className="md:col-span-7 space-y-5">
            <span className="text-xs font-bold text-teal-750 bg-teal-100/70 inline-block px-3 py-1.5 rounded-full uppercase tracking-wider">
              🧠 Neurologopedia e Higiene Vocal
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Logopedia para Adultos y Rehabilitación
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Las dificultades comunicativas en la adultez suelen surgir de imprevistos neurológicos (ictus, tumores), agotamiento vocal profesional, o el avance natural de enfermedades de la edad. Ofrecemos tratamientos especializados enfocados en recuperar el habla, restaurar la deglución sana y segura, y brindar técnicas vocales avanzadas.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectServiceForBooking("adu-afasia")}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer"
              >
                Solicitar Valoración de Adultos
              </button>
            </div>
          </div>
          
          <div className="md:col-span-5">
            <div className="rounded-2xl overflow-hidden aspect-square relative border border-brand-100 bg-white">
              <img
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=500&auto=format&fit=crop"
                alt="Manos cuidadosas de terapeuta apoyando terapia física de paciente mayor"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Neurologopedia callout - Early Warning Window */}
      <section className="bg-white rounded-3xl border border-brand-100 p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-brand-150 text-brand-700 shadow border border-brand-200">
            <ShieldAlert className="h-6 w-6 text-brand-600" />
          </div>
          <div className="space-y-3 flex-1">
            <h2 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight">
              Ictus y Afasia: La Importancia de la Rehabilitación Temprana
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Tras sufrir un accidente cerebrovascular (Ictus) o un traumatismo craneoencefálico, existe lo que los neurólogos denominan la <strong>&quot;ventana de neuroplasticidad crítica&quot;</strong> en los primeros 3 a 6 meses. Durante este espacio, entrenar intensamente el lenguaje, reeducar el punto de articulación y activar redes de lenguaje de soporte acelera la velocidad y el alcance de los logros lingüísticos definitivos del paciente.
            </p>
          </div>
        </div>

        <div className="border-t border-brand-50 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-neutral-700">
          <div className="flex gap-2.5 items-start">
            <span className="text-brand-500 text-sm mt-0.5">⭐</span>
            <span>Tratamientos orientados a la recuperación de vocabulario activo (denominación).</span>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-brand-500 text-sm mt-0.5">⭐</span>
            <span>Instauración de pautas y soportes aumentativos de apoyo inmediato para la familia.</span>
          </div>
        </div>
      </section>

      {/* Guidelines: swallowing and feeding safety in dysphagia */}
      <section className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
        <div className="absolute left-0 top-0 opacity-5 pointer-events-none translate-x-4 translate-y-4">
          <HeartHandshake className="h-[400px] w-[400px]" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="text-xs font-extrabold text-brand-400 uppercase tracking-widest block">Disfagia y Alimentos</span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Guía Esencial de Alimentación Segura en Casa
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed font-semibold">
            Muchos pacientes post-ictus o con enfermedades neurodegenerativas (Parkinson, ELA) experimentan atoros al tragar. Sigue estas recomendaciones vitales de deglución diaria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          <div className="p-5.5 rounded-2xl bg-neutral-800 border border-neutral-700/50 space-y-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-sm">1</div>
            <h3 className="font-display font-bold text-sm text-white">Postura de deglución correcta</h3>
            <p className="text-xs text-neutral-450 leading-relaxed font-semibold">
              El paciente debe comer sentado a 90 grados, con la espalda apoyada e inclinar ligeramente la barbilla hacia el propio pecho en el momento exacto de tragar. Nunca tragar mirando hacia arriba o acostado.
            </p>
          </div>

          <div className="p-5.5 rounded-2xl bg-neutral-800 border border-neutral-700/50 space-y-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-sm">2</div>
            <h3 className="font-display font-bold text-sm text-white">Evitar alimentos de DOBLE textura</h3>
            <p className="text-xs text-neutral-450 leading-relaxed font-semibold">
              Son sumamente peligrosas comidas como la sopa con fideos, sopa con tropezones, o mandarinas con mucho zumo, ya que el cerebro tiene que coordinar el tragar líquido y masticar sólido a la vez.
            </p>
          </div>

          <div className="p-5.5 rounded-2xl bg-neutral-800 border border-neutral-700/50 space-y-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-sm">3</div>
            <h3 className="font-display font-bold text-sm text-white">Consistencia gelatinosa (espesantes)</h3>
            <p className="text-xs text-neutral-450 leading-relaxed font-semibold">
              El agua corriente del grifo suele ser el reto más difícil porque baja muy rápido. Usar polvos espesantes clínicos especiales para dar textura de néctar o miel garantiza que pase despacio y de forma segura.
            </p>
          </div>

        </div>
      </section>

      {/* Specialty Sub-Listing cards for adults */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight text-center">
          Nuestras Áreas de Intervención para Adultos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adultServices.map(srv => (
            <div key={srv.id} className="p-6 bg-white rounded-2xl border border-brand-100 shadow-sm flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <span className="text-xl">🧠</span>
                <h3 className="font-display font-bold text-base text-neutral-900 leading-snug">{srv.title}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3">{srv.shortDesc}</p>
              </div>

              <button
                onClick={() => onSelectServiceForBooking(srv.id)}
                className="w-full py-2 bg-brand-50 hover:bg-brand-100 hover:text-brand-800 text-brand-700 text-xs font-bold rounded-xl tracking-wide transition-colors cursor-pointer text-center block"
              >
                Pedir cita para esta especialidad
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Vocal hygiene protocols */}
      <section className="bg-white rounded-3xl border border-brand-100 p-8 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight">
            Pautas de Higiene Vocal para Profesionales de la Voz
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-medium">
            Si eres profesor, teleoperador, cantante u orador habitual, tus cuerdas vocales sufren un esfuerzo continuado. Sigue estas pautas para alejar disfonías o nódulos laríngeos:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {voiceCareTips.map((tip, i) => (
            <div key={i} className="p-5 border border-brand-50 rounded-2xl bg-brand-50/20 space-y-1.5 hover:bg-brand-50/50 transition-colors">
              <h3 className="font-display font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <span className="text-brand-500 text-xs">●</span>
                {tip.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom check out trigger */}
      <section className="text-center space-y-4 py-4">
        <h3 className="font-display text-xl font-bold text-neutral-900">¿Necesitas una valoración especializada de adultos?</h3>
        <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Nuestras especialistas evaluarán cada caso con la máxima rigurosidad técnica para diseñar tu plan personalizado de rehabilitación.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onSelectServiceForBooking("adu-afasia")}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm tracking-wide cursor-pointer inline-flex items-center gap-2 transition-all shadow-md"
          >
            <Calendar className="h-4 w-4" />
            Agenda Valoración de Adultos
          </button>
        </div>
      </section>

    </div>
  );
}
