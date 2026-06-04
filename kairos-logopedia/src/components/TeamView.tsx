import React from "react";
import { Star, ShieldCheck, Mail, Calendar, Sparkles } from "lucide-react";
import { TEAM_MEMBERS_DATA } from "../data";

interface TeamViewProps {
  openBooking: () => void;
}

export default function TeamView({ openBooking }: TeamViewProps) {
  return (
    <div className="space-y-12 py-4 animate-fade-in">
      
      {/* View Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-neutral-900">
          Nuestro Equipo Clínico
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base font-medium">
          En Kairos Logopedia contamos con profesionales titulados y debidamente colegiados. Creemos en una formación continua de vanguardia para ofrecerte los métodos terapéuticos más efectivos.
        </p>
      </div>

      {/* Team grid */}
      <div className="space-y-8">
        {TEAM_MEMBERS_DATA.map((member, idx) => (
          <div
            key={member.id}
            className={`rounded-3xl bg-white border border-brand-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center ${
              idx % 2 === 1 ? "md:direction-rtl" : ""
            }`}
          >
            {/* Visual Portrait */}
            <div className="md:col-span-4 relative shrink-0">
              <div className="absolute inset-0 bg-radial-gradient from-brand-100 to-transparent opacity-40 blur-xl pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden aspect-4/5 border border-brand-150 shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale-1/10 hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Description and specialties column */}
            <div className="md:col-span-8 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-bold text-neutral-900 leading-tight">
                      {member.name}
                    </h2>
                    {member.collegiateNumber && (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 bg-brand-100 text-brand-800 rounded-lg tracking-wider uppercase">
                        {member.collegiateNumber}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-sm font-semibold text-brand-600">
                    {member.role}
                  </p>
                </div>

                <p className="text-neutral-600 text-sm leading-relaxed">
                  {member.bio}
                </p>

                {/* Specialties list */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Áreas de Especialización Directa:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-3 py-1.5 bg-neutral-50 hover:bg-brand-50 hover:text-brand-700 rounded-xl border border-neutral-100 transition-colors"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-50 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-brand-500" />
                  Profesión Sanitaria Regulada (Ministerio de Sanidad)
                </span>
                
                <button
                  onClick={openBooking}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow"
                >
                  <Calendar className="h-4 w-4" />
                  Pedir cita con {member.name.split(" ")[0]}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Quality commitment ribbon */}
      <section className="bg-brand-50 rounded-2xl p-6 border border-brand-100/50 flex flex-col sm:flex-row gap-5 items-center">
        <div className="h-10 w-10 shrink-0 bg-brand-500 text-white rounded-xl flex items-center justify-center shadow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <h3 className="font-display font-bold text-sm text-neutral-900">¿Tienes dudas sobre qué especialista elegir?</h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
            No te preocupes. En nuestra primera valoración presencial, analizamos exhaustivamente el caso del paciente y asignamos su intervención al logopeda con mayor bagaje clínico en esa área particular para optimizar sus progresos.
          </p>
        </div>
      </section>

    </div>
  );
}
