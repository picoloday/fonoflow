import React, { useState } from "react";
import { Menu, X, Calendar, MessageCircle, Heart } from "lucide-react";
import { AppView } from "../types";
import { CLINIC_INFO } from "../data";

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  openBooking: () => void;
}

export default function Navbar({ currentView, setView, openBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { view: AppView; label: string }[] = [
    { view: "inicio", label: "Inicio" },
    { view: "servicios", label: "Servicios" },
    { view: "pediatria", label: "Logopedia Infantil" },
    { view: "adultos", label: "Adultos" },
    { view: "equipo", label: "Equipo" },
    { view: "contacto", label: "Contacto" },
  ];

  // Helper check for active state
  const isActive = (view: AppView) => currentView === view;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-100 bg-white/95 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          onClick={() => { setView("inicio"); setMobileMenuOpen(false); }}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20">
            <Heart className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-neutral-900 leading-none">
              Kairos
            </span>
            <span className="font-display text-xs font-medium tracking-widest text-brand-600 uppercase mt-0.5 leading-none">
              Logopedia
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive(item.view)
                  ? "bg-brand-50 text-brand-700"
                  : "text-neutral-600 hover:text-brand-600 hover:bg-neutral-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          
          <button
            onClick={() => setView("mis-citas")}
            className={`ml-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
              isActive("mis-citas")
                ? "bg-brand-100 border-brand-300 text-brand-800"
                : "border-neutral-200 text-neutral-600 hover:text-brand-600 hover:border-brand-300 hover:bg-neutral-50"
            }`}
          >
            Mis Citas
          </button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:${CLINIC_INFO.phoneFormatted}`}
            className="text-sm font-semibold text-neutral-900 hover:text-brand-600 transition-colors hidden lg:inline-block"
          >
            {CLINIC_INFO.phone}
          </a>
          <button
            onClick={openBooking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            Pedir Cita
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setView("mis-citas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isActive("mis-citas")
                ? "bg-brand-100 border-brand-300 text-brand-800"
                : "border-neutral-200 text-neutral-600"
            }`}
          >
            Mis Citas
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-100 bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="space-y-1.5 px-4 py-4">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center px-4 py-3 rounded-xl text-base font-semibold cursor-pointer ${
                  isActive(item.view)
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-brand-600"
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="border-t border-brand-50 pt-3 mt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
                className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-brand-600 text-white font-bold leading-normal shadow-md shadow-brand-500/10 cursor-pointer"
              >
                <Calendar className="h-5 w-5" />
                Pedir Cita Online
              </button>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-neutral-500 font-medium">Llámanos directamente</p>
                <a
                  href={`tel:${CLINIC_INFO.phoneFormatted}`}
                  className="text-base font-bold text-brand-700 hover:underline"
                >
                  {CLINIC_INFO.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
