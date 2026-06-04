import React from "react";
import { ArrowRight, Star, Heart, CheckCircle, Smile, BookOpen, Brain, Activity } from "lucide-react";
import { CLINIC_INFO, TESTIMONIALS_DATA } from "../data";
import { AppView } from "../types";

interface HomeViewProps {
  setView: (view: AppView) => void;
  openBooking: () => void;
}

export default function HomeView({ setView, openBooking }: HomeViewProps) {
  return (
    <div className="space-y-16 py-4 animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-brand-100 p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-radial-gradient from-brand-50/70 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero text content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest">
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-600 animate-ping" />
              Consulta Presencial en Madrid
            </div>
            
            <div className="space-y-2">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                Kairos <span className="text-brand-600 block sm:inline">Logopedia</span>
              </h1>
              
              {/* Highlight of Slogan */}
              <p className="font-display italic text-brand-700 text-2xl sm:text-3xl font-medium tracking-wide">
                &ldquo;Mucho más que hablar&rdquo;
              </p>
            </div>

            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Somos un centro de logopedia clínica altamente especializado, dedicado al diagnóstico y tratamiento de alteraciones en la comunicación, el lenguaje, el habla, la voz y la deglución tanto en niños como en adultos.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={openBooking}
                className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm sm:text-base leading-none shadow-md shadow-brand-600/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Pedir Primera Cita
              </button>
              <button
                onClick={() => setView("servicios")}
                className="px-6 py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm sm:text-base leading-none transition-all cursor-pointer"
              >
                Ver Especialidades
              </button>
            </div>

            {/* Quick stats badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-50 max-w-md">
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-brand-700">100%</p>
                <p className="text-xs text-neutral-500 font-semibold mt-0.5">Atención Personalizada</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-brand-700">+10</p>
                <p className="text-xs text-neutral-500 font-semibold mt-0.5">Años de Experiencia</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-brand-700">CPLM</p>
                <p className="text-xs text-neutral-500 font-semibold mt-0.5">Logopedas Colegiados</p>
              </div>
            </div>

          </div>

          {/* Hero interactive visual banner, using Unsplash direct links */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-brand-600 to-accent-500 opacity-20 blur-lg rounded-3xl" />
            <div className="relative rounded-3xl overflow-hidden border border-brand-100 bg-brand-50 shadow-xl aspect-16/11">
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop"
                alt="Madre e hijo comunicándose alegremente"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-brand-100 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <Smile className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 leading-none">Intervención Efectiva</p>
                  <p className="text-[10px] text-brand-700 mt-1 font-semibold">Terapia basada en el juego y la neuroplasticidad</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SERVICES GATEWAY SECTION (INFANTIL / ADULTOS) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
            Unidad Especialista en tus Necesidades
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Contamos con dos áreas de atención altamente preparadas para dar respuesta adecuada a cada etapa de la vida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Logopedia Infantil */}
          <div className="group rounded-3xl bg-white border border-brand-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="h-56 relative overflow-hidden bg-brand-50">
              <img
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop"
                alt="Terapeuta trabajando con un menor jugando"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-pink-100/90 backdrop-blur-sm text-pink-700 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Pediatría y Escuela
              </div>
            </div>
            
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold text-neutral-900">
                  Logopedia Infantil y Juvenil
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Acompañamos a los más pequeños en la estimulación de su lenguaje, corrección del habla, dificultades de lectoescritura (dislexia) y deglución atípica de manera motivadora e interactiva.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Retraso del habla</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Dislexia</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Respiración bucal</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Fisiología orofacial</span>
                </div>
              </div>

              <button
                onClick={() => setView("pediatria")}
                className="inline-flex items-center gap-2 font-display font-bold text-sm text-brand-600 group-hover:text-brand-800 transition-colors cursor-pointer self-start"
              >
                Explorar Terapia Infantil
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card: Logopedia Adultos */}
          <div className="group rounded-3xl bg-white border border-brand-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
            <div className="h-56 relative overflow-hidden bg-brand-50">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop"
                alt="Rehabilitación del habla de adulto mayor"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-purple-100/90 backdrop-blur-sm text-purple-700 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Rehabilitación y Neuro
              </div>
            </div>
            
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-2xl font-bold text-neutral-900">
                  Logopedia para Adultos
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Ofrecemos programas terapéuticos diseñados para recuperar capacidades perdidas tras un daño cerebral (ictus, afasia), tratar la disfagia (problemas al tragar), reeducar la voz y enlentecer el impacto de patologías neurodegenerativas.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Afasia por Ictus</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Disfagia / Tos al comer</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Disfonía vocal</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">Parkinson / Alzheimer</span>
                </div>
              </div>

              <button
                onClick={() => setView("adultos")}
                className="inline-flex items-center gap-2 font-display font-bold text-sm text-brand-600 group-hover:text-brand-800 transition-colors cursor-pointer self-start"
              >
                Explorar Terapia de Adultos
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. OUR CLINICAL CORE VALUES / PHILOSOPHY */}
      <section className="bg-brand-100/50 rounded-3xl border border-brand-100 p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-neutral-900 tracking-tight">
            Nuestros Pilares de Calidad
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 leading-relaxed">
            La intervención de calidad va mucho más allá de corregir letras aisladas. Nos centramos en dar pautas útiles, empoderando al paciente para que su comunicación sea fluida y funcional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-brand-100 flex flex-col gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-500 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-neutral-900 text-base">Evidencia Científica</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Trabajamos exclusivamente con métodos y pruebas estandarizadas que gozan del máximo respaldo científico para asegurar la consecución de objetivos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-100 flex flex-col gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-500 text-white">
              <Smile className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-neutral-900 text-base">Atención Cercana y de Confianza</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Establecemos un lazo afectivo fuerte con los pacientes y sus familias. Lograr un ambiente amigable y libre de exigencias favorece la velocidad de recuperación.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-100 flex flex-col gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-500 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-neutral-900 text-base">Coordinación Plena de Entornos</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Nos coordinamos con colegios, pediatras, terapeutas ocupacionales o neurólogos del paciente para que todo su equipo trabaje bajo las mismas directrices de superación.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CLINICAL TEAM SHORT INTRO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-brand-100 p-8 sm:p-12">
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block">Nuestras Especialistas</span>
          <h2 className="font-display text-4xl font-extrabold text-neutral-900 tracking-tight leading-none">
            Clínica <br className="hidden lg:inline" /> Colegiada
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed font-semibold">
            Profesionales titulados apasionados por restaurar la voz, el habla y fomentar la comunicación respetuosa y feliz.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setView("equipo")}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
            >
              Conoce nuestro equipo clínico
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 border border-brand-100 rounded-2xl flex gap-4 items-center">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop"
              alt="Ana Sanz Guerrero"
              className="w-16 h-16 rounded-xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-display font-bold text-sm text-neutral-900 leading-none">Ana Sanz Guerrero</p>
              <p className="text-xs text-brand-600 mt-1">Adultos y Neurologopedia</p>
              <p className="text-[10px] text-neutral-400 mt-1">Colegiada nº 28/1423</p>
            </div>
          </div>

          <div className="p-5 border border-brand-100 rounded-2xl flex gap-4 items-center">
            <img
              src="https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=300&auto=format&fit=crop"
              alt="Lucía Ortega"
              className="w-16 h-16 rounded-xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-display font-bold text-sm text-neutral-900 leading-none">Lucía Ortega Alarcón</p>
              <p className="text-xs text-brand-600 mt-1">Especialista Infantil</p>
              <p className="text-[10px] text-neutral-400 mt-1">Colegiada nº 28/2085</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTIONS */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-extrabold text-neutral-900 tracking-tight">
            Familias y Pacientes que Confían en Nosotros
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-xl mx-auto font-medium">
            El mayor logro es la felicidad del paciente cuando se comunica de forma autónoma. Estas son algunas de sus historias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS_DATA.map((t) => (
            <div key={t.id} className="p-6 rounded-3xl bg-white border border-brand-100 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex gap-0.5 text-orange-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 text-sm italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
              <div className="border-t border-brand-50 pt-3 flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-sm text-neutral-900">{t.name}</span>
                  {t.relation && (
                    <span className="text-xs text-brand-600 font-semibold block mt-0.5">{t.relation}</span>
                  )}
                </div>
                <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BOTTOM CALL-TO-ACTION FOR BOOKING */}
      <section className="rounded-3xl bg-neutral-900 p-8 sm:p-12 text-center text-white relative overflow-hidden flex flex-col items-center">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Heart className="h-96 w-96 text-white" />
        </div>
        
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-extrabold text-brand-400 uppercase tracking-widest block">Evaluación Inicial Preventiva</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            ¿Quieres resolver tus dudas con un logopeda colegiado?
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Te ofrecemos un espacio cálido y respetuoso. Si sospechas de dificultades en el habla de tu menor o necesitas rehabilitación neurologopédica para un familiar, agenda hoy mismo online.
          </p>
          <div className="pt-2">
            <button
              onClick={openBooking}
              className="px-8 py-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-2xl font-bold leading-none shadow-lg shadow-brand-500/10 cursor-pointer inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              Pedir Cita Online Ahora
            </button>
            <p className="text-xs text-neutral-500 font-medium mt-3">
              O llámanos directamente al <span className="text-brand-300 underline font-semibold cursor-pointer">{CLINIC_INFO.phone}</span>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
