import React, { useState, useEffect } from "react";
import { Calendar, Trash2, ShieldAlert, Sparkles, User, BadgeAlert, Clock, CheckCircle } from "lucide-react";
import { Appointment } from "../types";

interface AppointmentsListProps {
  onOpenBooking: () => void;
  refreshTrigger: number; // Trigger list reload
}

export default function AppointmentsList({ onOpenBooking, refreshTrigger }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from localStorage
  const loadAppointments = () => {
    const existing = localStorage.getItem("kairos_appointments");
    if (existing) {
      try {
        setAppointments(JSON.parse(existing));
      } catch (e) {
        console.error("Error reading appointments", e);
      }
    } else {
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [refreshTrigger]);

  const handleCancelAppointment = (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cancelar esta solicitud de cita? Te enviaremos igualmente una confirmación por sms."
    );
    if (!confirmed) return;

    const updated = appointments.map((app) => {
      if (app.id === id) {
        return { ...app, status: "cancelada" as const };
      }
      return app;
    });

    localStorage.setItem("kairos_appointments", JSON.stringify(updated));
    setAppointments(updated);
  };

  const handleDeleteAppointment = (id: string) => {
    const confirmed = window.confirm(
      "¿Deseas eliminar permanentemente este registro de cita de tu historial?"
    );
    if (!confirmed) return;

    const filtered = appointments.filter((app) => app.id !== id);
    localStorage.setItem("kairos_appointments", JSON.stringify(filtered));
    setAppointments(filtered);
  };

  return (
    <div className="space-y-10 py-4 animate-fade-in animate-fade-in">
      
      {/* Page header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-neutral-900">
          Mis Solicitudes de Cita
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base font-medium">
          Aquí puedes realizar el seguimiento de los turnos solicitados en nuestra clínica. Nos pondremos en contacto contigo por teléfono móvil para la confirmación horaria final.
        </p>
      </div>

      {appointments.length === 0 ? (
        /* Empty State Card layout */
        <div className="max-w-xl mx-auto text-center py-16 bg-white border border-brand-100 rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-650 shadow-inner">
            <Calendar className="h-8 w-8 text-brand-500" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-neutral-950">No tienes citas solicitadas en este navegador</h3>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-medium">
              Aún no has rellenado ninguna solicitud de turno. Pulsa el botón inferior para abrir el calendar interactivo y reservar tu espacio preferido.
            </p>
          </div>
          <div>
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold leading-none shadow-md shadow-brand-500/10 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              Pedir Mi Primera Cita
            </button>
          </div>
        </div>
      ) : (
        /* Appointments grid list */
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-between items-center bg-brand-50 border border-brand-100/50 p-4.5 rounded-2xl">
            <span className="text-xs text-brand-850 font-bold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-brand-600" />
              Las solicitudes guardadas se asocian de forma privada a este dispositivo.
            </span>
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold leading-none cursor-pointer"
            >
              + Nueva Cita
            </button>
          </div>

          <div className="space-y-4">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-brand-100 rounded-3xl p-6.5 shadow-sm space-y-4.5 hover:border-brand-250 transition-all"
              >
                {/* Appointment main row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-50 pb-4">
                  <div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      app.serviceCategory === "infantil" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {app.serviceCategory === "infantil" ? "🍭 Logopedia Infantil" : "🧠 Adultos y Neuro"}
                    </span>
                    <h3 className="font-display font-extrabold text-base text-neutral-900 mt-2">
                      {app.serviceType}
                    </h3>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    {app.status === "pendiente" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wide">
                        <Clock className="h-3 w-3" />
                        Pendiente Confirmación
                      </span>
                    )}
                    {app.status === "confirmada" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wide animate-pulse">
                        <CheckCircle className="h-3 w-3" />
                        Turno Confirmado
                      </span>
                    )}
                    {app.status === "cancelada" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-wide">
                        ✕ Cancelada
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient / Schedule details row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 text-xs text-neutral-700">
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-bold uppercase">Paciente</p>
                    <p className="font-bold flex items-center gap-1.5 text-sm text-neutral-900 mt-0.5">
                      <User className="h-4 w-4 text-brand-600" />
                      {app.patientName}
                    </p>
                    {app.guardianName && (
                      <p className="text-neutral-500 font-semibold text-[10px] sm:text-xs">
                        Tutor: {app.guardianName} ({app.patientAge} años)
                      </p>
                    )}
                    {!app.guardianName && (
                      <p className="text-neutral-500 font-semibold text-[10px] sm:text-xs">
                        Edad: {app.patientAge} años
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-neutral-400 font-bold uppercase">Fecha Solicitada</p>
                    <p className="font-bold text-neutral-900 text-sm mt-0.5">
                      {app.date}
                    </p>
                    <p className="text-neutral-500 font-semibold text-[10px] sm:text-xs">
                      Horario: {app.timeSlot}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-neutral-400 font-bold uppercase">Datos de Contacto</p>
                    <p className="font-semibold text-neutral-900 mt-0.5">{app.phone}</p>
                    <p className="text-neutral-500 text-[10px] sm:text-xs font-medium truncate">{app.email}</p>
                  </div>
                </div>

                {/* Additional Patient notes description */}
                {app.notes && (
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 text-xs text-neutral-600">
                    <p className="font-bold text-neutral-400 uppercase text-[10px] tracking-wide mb-1">Motivo de consulta facilitado:</p>
                    &ldquo;{app.notes}&rdquo;
                  </div>
                )}

                {/* Action Cancels, Rescheduling warnings */}
                <div className="border-t border-brand-50 pt-4 flex gap-3.5 items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
                    Registrada el {app.createdAt}
                  </span>

                  <div className="flex gap-2">
                    {app.status === "pendiente" && (
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="px-3.5 py-1.5 border border-amber-250 hover:bg-amber-50 text-amber-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        Cancelar Solicitud
                      </button>
                    )}

                    {(app.status === "cancelada" || app.status === "confirmada") && (
                      <button
                        onClick={() => handleDeleteAppointment(app.id)}
                        className="px-3 py-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-50 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                        title="Eliminar de historial"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
