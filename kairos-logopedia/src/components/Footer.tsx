import React from "react";
import { Heart, Phone, Mail, MapPin, Clock } from "lucide-react";
import { AppView } from "../types";
import { CLINIC_INFO } from "../data";

interface FooterProps {
  setView: (view: AppView) => void;
  openBooking: () => void;
}

export default function Footer({ setView, openBooking }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8 border-t border-brand-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div 
              onClick={() => setView("inicio")}
              className="flex cursor-pointer items-center gap-2 text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md">
                <Heart className="h-6 w-6 stroke-[2.5px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold tracking-tight leading-none text-white">
                  Kairos
                </span>
                <span className="font-display text-[10px] font-semibold tracking-widest text-brand-400 uppercase mt-0.5 leading-none">
                  Logopedia
                </span>
              </div>
            </div>
            <p className="font-display italic text-brand-300 text-sm font-medium">
              &ldquo;Mucho más que hablar&rdquo;
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Logopedia clínica para todas las etapas de la vida. Diagnósticos rigurosos, atención individualizada y tratamientos basados en evidencia científica.
            </p>
            <div className="pt-2 text-xs text-neutral-500">
              Todos nuestros profesionales son logopedas colegiados inscritos en el Colegio Profesional de Logopedas de Madrid (CPLM).
            </div>
          </div>

          {/* Col 2: Services / Paths */}
          <div>
            <h3 className="text-white font-display font-semibold text-base mb-4 tracking-wide">
              Especialidades
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setView("pediatria")} 
                  className="hover:text-brand-400 transition-colors cursor-pointer text-left"
                >
                  Logopedia Infantil y Juvenil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView("adultos")} 
                  className="hover:text-brand-400 transition-colors cursor-pointer text-left"
                >
                  Neurologopedia (Ictus, Afasia)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView("adultos")} 
                  className="hover:text-brand-400 transition-colors cursor-pointer text-left"
                >
                  Disfagia y Deglución Segura
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView("servicios")} 
                  className="hover:text-brand-400 transition-colors cursor-pointer text-left"
                >
                  Terapia Miofuncional (TMF)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView("servicios")} 
                  className="hover:text-brand-400 transition-colors cursor-pointer text-left"
                >
                  Alteraciones de la Voz y Ronquera
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setView("servicios")} 
                  className="hover:text-brand-400 transition-colors cursor-pointer text-left"
                >
                  Trastornos de la Lectoescritura
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Practical Navigation */}
          <div>
            <h3 className="text-white font-display font-semibold text-base mb-4 tracking-wide">
              Enlaces de Interés
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setView("inicio")} className="hover:text-brand-400 transition-colors cursor-pointer">
                  Inicio / Quiénes Somos
                </button>
              </li>
              <li>
                <button onClick={() => setView("equipo")} className="hover:text-brand-400 transition-colors cursor-pointer">
                  Nuestro Equipo Clínico
                </button>
              </li>
              <li>
                <button onClick={() => setView("contacto")} className="hover:text-brand-400 transition-colors cursor-pointer">
                  Ubicación y Contacto
                </button>
              </li>
              <li>
                <button onClick={() => setView("mis-citas")} className="hover:text-brand-400 transition-colors cursor-pointer">
                  Verificar mis Solicitudes de Cita
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={openBooking}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Pedir Cita Online
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Clinic */}
          <div className="space-y-4 text-sm">
            <h3 className="text-white font-display font-semibold text-base mb-4 tracking-wide">
              Contacto y Horario
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  {CLINIC_INFO.address}
                  <br />
                  <span className="text-neutral-500 font-medium">
                    {CLINIC_INFO.postalCode}, {CLINIC_INFO.city}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-brand-400 shrink-0" />
                <a href={`tel:${CLINIC_INFO.phoneFormatted}`} className="hover:text-brand-400 transition-colors">
                  {CLINIC_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-brand-400 shrink-0" />
                <a href={`mailto:${CLINIC_INFO.email}`} className="hover:text-brand-400 transition-colors">
                  {CLINIC_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-2">
                <Clock className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-neutral-400 text-xs leading-relaxed">
                  {CLINIC_INFO.schedule}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 font-medium">
          <p>© {year} Kairos Logopedia. Todos los derechos reservados. Madrid, España.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-neutral-400 pointer-events-none">Aviso Legal</span>
            <span>•</span>
            <span className="hover:text-neutral-400 pointer-events-none">Política de Privacidad</span>
            <span>•</span>
            <span className="hover:text-neutral-400 pointer-events-none">RGPD / Protección de Datos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
