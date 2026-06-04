import React, { useState, useEffect } from "react";
import { X, Calendar as CalIcon, Clock, User, Phone, Mail, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { Appointment, ServiceItem } from "../types";
import { SERVICES_DATA, AVAILABLE_TIME_SLOTS } from "../data";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: "infantil" | "adulto";
  initialServiceId?: string;
  onSuccess: () => void; // Trigger callback to update list
}

export default function BookingModal({ isOpen, onClose, initialCategory, initialServiceId, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<"infantil" | "adulto">("infantil");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  
  // Form fields
  const [patientName, setPatientName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  
  // Local active error messages
  const [errorMsg, setErrorMsg] = useState("");

  // Sync initial parameters
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
      // Pre-select the category matching this service
      const matched = SERVICES_DATA.find(s => s.id === initialServiceId);
      if (matched) {
        setCategory(matched.category);
      }
    } else {
      setSelectedServiceId("");
    }
  }, [initialCategory, initialServiceId, isOpen]);

  if (!isOpen) return null;

  // Filter services by active category
  const filteredServices = SERVICES_DATA.filter(s => s.category === category);

  // Today's date in YYYY-MM-DD format for calendar min attribute
  const todayStr = new Date().toISOString().split("T")[0];

  // Advance steps validations
  const handleNextStep = () => {
    setErrorMsg("");
    
    if (step === 1) {
      if (!selectedServiceId) {
        setErrorMsg("Por favor, selecciona una especialidad para continuar.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedDate) {
        setErrorMsg("Por favor, elige una fecha para tu sesión.");
        return;
      }
      if (!selectedTime) {
        setErrorMsg("Por favor, selecciona un horario disponible.");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!patientName.trim()) {
      setErrorMsg("El nombre del paciente es obligatorio.");
      return;
    }
    
    const ageNum = parseInt(patientAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 115) {
      setErrorMsg("Por favor, introduce una edad válida.");
      return;
    }

    if (category === "infantil" && ageNum < 18 && !guardianName.trim()) {
      setErrorMsg("Para menores de edad, es necesario incluir el nombre de un tutor.");
      return;
    }

    // RegEx validation for basic email and phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Por favor, introduce un correo electrónico válido.");
      return;
    }

    if (phone.trim().length < 9) {
      setErrorMsg("Por favor, introduce un teléfono de contacto de al menos 9 dígitos.");
      return;
    }

    // Capture service name object
    const matchedService = SERVICES_DATA.find(s => s.id === selectedServiceId);
    const serviceName = matchedService ? matchedService.title : "Logopedia General";

    // Build appointment object
    const newAppointment: Appointment = {
      id: "appointment-" + Date.now(),
      patientName: patientName.trim(),
      guardianName: category === "infantil" ? guardianName.trim() : undefined,
      patientAge: ageNum,
      email: email.trim(),
      phone: phone.trim(),
      serviceCategory: category,
      serviceType: serviceName,
      date: selectedDate,
      timeSlot: selectedTime,
      notes: notes.trim() || undefined,
      createdAt: new Date().toLocaleDateString("es-ES"),
      status: "pendiente"
    };

    // Save to localStorage
    const existing = localStorage.getItem("kairos_appointments");
    const currentList: Appointment[] = existing ? JSON.parse(existing) : [];
    currentList.push(newAppointment);
    localStorage.setItem("kairos_appointments", JSON.stringify(currentList));

    // Move to success step!
    setStep(4);
    onSuccess();
  };

  const handleClose = () => {
    // Reset form states
    setStep(1);
    setPatientName("");
    setGuardianName("");
    setPatientAge("");
    setEmail("");
    setPhone("");
    setNotes("");
    setSelectedDate("");
    setSelectedTime("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/50 px-6 py-4.5">
          <div>
            <h2 className="font-display text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold">
                C
              </span>
              Pedir Cita Online
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Kairos Logopedia • Madrid</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Progress bar */}
          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-bold mb-2 uppercase tracking-wide">
                <span>Paso {step} de 3</span>
                <span>
                  {step === 1 && "Servicio y Especialidad"}
                  {step === 2 && "Fecha y Horario"}
                  {step === 3 && "Datos de Contacto"}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div 
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-orange-50 border border-orange-200 p-4.5 text-sm text-orange-800">
              <p className="font-semibold flex items-center gap-1.5">
                <span>⚠️</span> {errorMsg}
              </p>
            </div>
          )}

          {/* STEP 1: Categories and Subcategories selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-neutral-800 block mb-3">
                  1. División de Logopedia
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("infantil");
                      setSelectedServiceId("");
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      category === "infantil"
                        ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/15"
                        : "border-neutral-200 hover:border-brand-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-xl">👶</span>
                    <span className="font-display font-semibold text-sm text-neutral-900">
                      Infantil y Juvenil
                    </span>
                    <span className="text-xs text-neutral-500">
                      Terapia miofuncional, dislexia, retraso del habla, TEA...
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory("adulto");
                      setSelectedServiceId("");
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      category === "adulto"
                        ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/15"
                        : "border-neutral-200 hover:border-brand-200 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-xl">👵</span>
                    <span className="font-display font-semibold text-sm text-neutral-900">
                      Adultos y Neuro
                    </span>
                    <span className="text-xs text-neutral-500">
                      Ictus, afasia, disfagia, disfonía vocal, tartamudez...
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-neutral-800 block mb-3">
                  2. Especialidad o Tratamiento Requerido
                </label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  {filteredServices.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        selectedServiceId === srv.id
                          ? "border-brand-500 bg-brand-50/20 text-brand-900 font-medium"
                          : "border-neutral-200 hover:border-brand-200 hover:bg-neutral-50/30 text-neutral-700"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selectedServiceId === srv.id
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-neutral-300"
                      }`}>
                        {selectedServiceId === srv.id && <Check className="h-3. w-3" />}
                      </div>
                      <div className="flex duration-200 flex-col leading-tight">
                        <span className="text-sm font-semibold text-neutral-900">{srv.title}</span>
                        <span className="text-xs text-neutral-500 mt-0.5">{srv.shortDesc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Selection of Date and Time */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-neutral-800 block mb-2 flex items-center gap-1.5">
                    <CalIcon className="h-4 w-4 text-brand-600" />
                    1. Elige una fecha
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(""); // Reset time for new date
                    }}
                    className="w-full p-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                  <p className="text-xs text-neutral-400 mt-2">
                    Las citas en fines de semana solo se coordinan previa confirmación telefónica.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-neutral-800 block mb-2 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-600" />
                    2. Horas libres ({selectedDate ? "Disponibles" : "Elige fecha primero"})
                  </label>
                  
                  {!selectedDate ? (
                    <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 p-4 text-center text-xs font-semibold">
                      Por favor, selecciona una fecha a la izquierda primero para consultar disponibilidad.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 h-[180px] overflow-y-auto pr-2">
                      {AVAILABLE_TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2.5 rounded-xl border text-center font-display text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                            selectedTime === slot
                              ? "border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/15"
                              : "border-neutral-200 text-neutral-700 hover:border-brand-200 hover:bg-neutral-50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Contact details fields */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Nombre Completo del Paciente *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Ej. Sofía Martín Herrero"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Edad del Paciente *
                  </label>
                  <input
                    type="number"
                    placeholder="Ej. 6"
                    min="1"
                    max="115"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    required
                  />
                </div>

                {category === "infantil" && (
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Nombre del Padre / Madre / Tutor * (Requerido para niños)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Manuel Martín de la Rosa"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                  </div>
                )}

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="ejemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Teléfono Móvil de Contacto *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                    <input
                      type="tel"
                      placeholder="Ej. 612345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Describe brevemente la dificultad o motivo de la consulta
                  </label>
                  <textarea
                    placeholder="Escribe aquí cualquier síntoma, antecedente clínico o detalle que nos ayude a preparar la sesión..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                  />
                </div>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS OVERLAY */}
          {step === 4 && (
            <div className="py-8 text-center space-y-5 animate-fade-in">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                <Check className="h-9 w-9 stroke-[3px]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-neutral-900 tracking-tight flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-500 animate-pulse" />
                  ¡Solicitud Procesada!
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Hemos anotado tu solicitud para el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>. 
                  Un especialista de nuestro equipo de <strong>Kairos Logopedia</strong> se pondrá en contacto contigo por teléfono en las próximas 2 horas laborables para confirmar la disponibilidad definitiva y formalizar la cita.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-brand-50 border border-brand-100/50 text-left space-y-2">
                <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wide">Resumen del Turno</h4>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs text-neutral-700">
                  <span className="font-semibold">Paciente:</span>
                  <span>{patientName}</span>
                  <span className="font-semibold">Área:</span>
                  <span>{category === "infantil" ? "Logopedia Infantil" : "Adultos"}</span>
                  <span className="font-semibold">Especialidad:</span>
                  <span>{SERVICES_DATA.find(s => s.id === selectedServiceId)?.title}</span>
                  <span className="font-semibold">Fecha y Hora:</span>
                  <span>{selectedDate} ({selectedTime})</span>
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                Puedes consultar el estado de todas tus solicitudes en la pestaña superior &ldquo;Mis Citas&rdquo;.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Entendido, Cerrar
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Action button footers */}
        {step < 4 && (
          <div className="border-t border-brand-100 px-6 py-4.5 bg-neutral-50 flex justify-between items-center shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all cursor-pointer"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                Enviar Solicitud
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
