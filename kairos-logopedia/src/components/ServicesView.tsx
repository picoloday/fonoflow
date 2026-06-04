import React, { useState } from "react";
import { Search, Info, CheckCircle, ArrowRight, Baby, BookOpen, Activity, Brain, MessageCircle, Utensils, Music, ShieldAlert, Heart, Calendar } from "lucide-react";
import { SERVICES_DATA } from "../data";
import { ServiceItem } from "../types";

interface ServicesViewProps {
  onSelectServiceForBooking: (serviceId: string) => void;
}

export default function ServicesView({ onSelectServiceForBooking }: ServicesViewProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "infantil" | "adulto">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Map string icon names to React stroke components
  const renderIcon = (name: string, className = "h-6 w-6 text-brand-600") => {
    switch (name) {
      case "Baby":
        return <Baby className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Activity":
        return <Activity className={className} />;
      case "Brain":
        return <Brain className={className} />;
      case "MessageCircle":
        return <MessageCircle className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Music":
        return <Music className={className} />;
      case "ShieldAlert":
        return <ShieldAlert className={className} />;
      default:
        return <Heart className={className} />;
    }
  };

  // Filter service listing on UI interactively
  const filteredServices = SERVICES_DATA.filter((srv) => {
    // 1. Tab match
    const tabMatch = activeTab === "todos" || srv.category === activeTab;
    // 2. Search match
    const searchLower = searchQuery.toLowerCase();
    const searchMatch =
      srv.title.toLowerCase().includes(searchLower) ||
      srv.shortDesc.toLowerCase().includes(searchLower) ||
      srv.description.toLowerCase().includes(searchLower) ||
      srv.indications.some((ind) => ind.toLowerCase().includes(searchLower)) ||
      srv.treatments.some((treat) => treat.toLowerCase().includes(searchLower));

    return tabMatch && searchMatch;
  });

  return (
    <div className="space-y-10 py-4 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-neutral-900">
          Especialidades de Logopedia
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base font-medium">
          Explora nuestra oferta diagnóstica y terapéutica para encontrar el tratamiento correcto. Filtra por grupo de edad o introduce términos de consulta.
        </p>
      </div>

      {/* Control Panel: Category Toggle and Search input */}
      <div className="bg-white rounded-3xl border border-brand-100 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Tab triggers */}
        <div className="flex gap-1.5 p-1 whitespace-nowrap bg-brand-50 rounded-2xl w-full md:w-auto">
          {(["todos", "infantil", "adulto"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold uppercase tracking-wide transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-neutral-500 hover:text-brand-600"
              }`}
            >
              {tab === "todos" && "Ver Todos"}
              {tab === "infantil" && "👶 Logopedia Infantil"}
              {tab === "adulto" && "👵 Adultos y Neuro"}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar alteración, ej. dislexia, voz..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium bg-neutral-50/50 focus:bg-white"
          />
        </div>

      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white border border-brand-100 rounded-3xl space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-neutral-800">No se encontraron especialidades</p>
            <p className="text-neutral-500 text-sm mt-1 max-w-sm mx-auto">
              Intenta cambiar tu término de búsqueda o selecciona otra categoría de filtro de edad.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="group rounded-2xl bg-white border border-brand-100 p-6 flex flex-col justify-between gap-5 hover:shadow-md hover:border-brand-300 transition-all duration-300 relative overflow-hidden"
            >
              {categoryMarker(srv.category)}
              
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 shadow-sm">
                  {renderIcon(srv.iconName)}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-lg text-neutral-900 group-hover:text-brand-700 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-brand-50 pt-4.5 flex items-center justify-between">
                <button
                  onClick={() => setSelectedService(srv)}
                  className="text-xs font-bold text-neutral-600 hover:text-brand-600 flex items-center gap-1 cursor-pointer"
                >
                  Ver Detalles Clínicos
                  <ArrowRight className="h-3 w-3" />
                </button>

                <button
                  onClick={() => onSelectServiceForBooking(srv.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-bold tracking-wide transition-colors cursor-pointer"
                >
                  <Calendar className="h-3 w-3" />
                  Pedir Cita
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED EXPANSION DRAWER/MODAL FOR SELECTED SERVICE */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/50 px-6 py-4.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                  {renderIcon(selectedService.iconName, "h-5 w-5 text-white")}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-neutral-900 leading-none">
                    {selectedService.title}
                  </h3>
                  <p className="text-[10px] text-brand-700 uppercase tracking-wider font-extrabold mt-1">
                    {selectedService.category === "infantil" ? "🍬 Logopedia Infantil" : "💼 Logopedia Adultos"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Descripción del Tratamiento</h4>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Signs/Indications Checklist */}
              <div className="space-y-3 bg-orange-50/50 rounded-2xl border border-orange-100 p-4.5">
                <h4 className="text-xs font-extrabold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                  💡 ¿Cuándo acudir? Signos de Alarma
                </h4>
                <ul className="space-y-2 text-xs text-neutral-700 font-medium">
                  {selectedService.indications.map((ind, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-orange-500 shrink-0 mt-0.5">🐾</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Treatments Solutions list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide">¿Cómo intervenimos en Kairos?</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedService.treatments.map((t, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs text-neutral-700">
                      <CheckCircle className="h-4.5 w-4.5 text-brand-500 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="border-t border-brand-100 p-4.5 bg-neutral-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const srvId = selectedService.id;
                  setSelectedService(null);
                  onSelectServiceForBooking(srvId);
                }}
                className="flex items-center gap-1 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow"
              >
                <Calendar className="h-3.5 w-3.5" />
                Pedir Cita Especialidad
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Small color helpers
function categoryMarker(category: "infantil" | "adulto") {
  if (category === "infantil") {
    return (
      <span className="absolute top-0 right-0 py-1 px-3 bg-pink-50 text-pink-700 text-[10px] font-extrabold uppercase rounded-bl-xl tracking-wider">
        🍭 Infantil
      </span>
    );
  }
  return (
    <span className="absolute top-0 right-0 py-1 px-3 bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase rounded-bl-xl tracking-wider">
      🧠 Adulto
    </span>
  );
}
