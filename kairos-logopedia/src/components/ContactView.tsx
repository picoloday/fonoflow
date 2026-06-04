import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, HelpCircle, ChevronDown, Check } from "lucide-react";
import { CLINIC_INFO, FAQS_DATA } from "../data";

export default function ContactView() {
  // Contact Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // FAQ Expand state map
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  // Active FAQ Category state
  const [faqCategory, setFaqCategory] = useState<"todos" | "general" | "pediatria" | "adultos">("todos");

  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg("Por favor, rellena todos los campos del formulario.");
      return;
    }

    // RegEx validation for email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Por favor, introduce un correo electrónico válido.");
      return;
    }

    if (phone.trim().length < 9) {
      setErrorMsg("El número de teléfono debe incluir al menos 9 dígitos.");
      return;
    }

    // Submission success simulation!
    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  // Filter FAQs on demand
  const filteredFaqs = FAQS_DATA.filter(
    faq => faqCategory === "todos" || faq.category === faqCategory
  );

  return (
    <div className="space-y-12 py-4 animate-fade-in animate-fade-in">
      
      {/* View Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-neutral-900">
          Ubicación y Contacto
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base font-medium">
          Estamos en el centro de Madrid, perfectamente conectados por metro y autobús. No dudes en escribirnos o llamarnos para cualquier consulta previa.
        </p>
      </div>

      {/* Main Grid: Info columns + Contact form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Contact Cards + Working hours */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="rounded-2xl bg-white border border-brand-100 p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-bold text-lg text-neutral-900 border-b border-brand-50 pb-2.5">
              Nuestra Clínica
            </h2>
            
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">Dirección</p>
                  <p className="text-neutral-500 font-medium mt-0.5">{CLINIC_INFO.address}</p>
                  <p className="text-neutral-400 font-medium text-xs mt-0.5">{CLINIC_INFO.postalCode}, {CLINIC_INFO.city} (Entreplanta)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">Teléfono Directo</p>
                  <a href={`tel:${CLINIC_INFO.phoneFormatted}`} className="text-brand-600 font-semibold hover:underline block mt-0.5">
                    {CLINIC_INFO.phone}
                  </a>
                  <p className="text-neutral-400 font-medium text-xs mt-0.5">Atención telefónica de lunes a viernes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">Correo Electrónico</p>
                  <a href={`mailto:${CLINIC_INFO.email}`} className="text-brand-600 font-semibold hover:underline block mt-0.5">
                    {CLINIC_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900">Horario de Consultas</p>
                  <p className="text-neutral-500 font-medium mt-0.5">{CLINIC_INFO.schedule}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Practical travel directions */}
          <div className="rounded-2xl bg-brand-50 border border-brand-100 p-6 space-y-3">
            <h3 className="font-display font-bold text-xs text-brand-800 uppercase tracking-wider">¿Cómo llegar?</h3>
            <ul className="space-y-2 text-xs text-neutral-700 font-medium">
              <li className="flex gap-2">
                <span className="text-brand-600 shrink-0">🚇</span>
                <span><strong>Metro:</strong> Estación de Manuel Becerra (Líneas 2 y 6) a solo 3 minutos de distancia andando.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-600 shrink-0">🚌</span>
                <span><strong>Autobús EMT:</strong> Líneas 21, 38, 53, 106, 110, 143, 146 y 156 con parada en la propia calle de Alcalá.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-600 shrink-0">🚗</span>
                <span><strong>Parking:</strong> Parking público vigilado a escasos metros en la Calle del Dr. Esquerdo, 5.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Col: Submission form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-white border border-brand-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-display font-bold text-xl text-neutral-900">
                Escríbenos tu Consulta
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm font-medium">
                Si deseas hacernos una pregunta general, solicitar presupuestos para informes escolares o pedir pautas, rellena este formulario y te responderemos en el mismo día.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-3 animate-fade-in">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                  <Check className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-neutral-900">¡Mensaje Recibido!</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-semibold max-w-sm mx-auto">
                    Tu consulta ha sido enviada con éxito. Uno de nuestros logopedas revisará tu mensaje y se pondrá en contacto contigo de forma privada en el correo facilitado.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg p-2.5">
                    ⚠️ {errorMsg}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-700 uppercase">Nombre Completo *</label>
                    <input
                      type="text"
                      placeholder="Ej. Sofía Martín"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-700 uppercase">Móvil de Contacto *</label>
                    <input
                      type="tel"
                      placeholder="Ej. 612345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 uppercase">Correo Electrónico *</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-700 uppercase">Mensaje o Consulta *</label>
                  <textarea
                    placeholder="Describe en qué consiste tu consulta, síntomas, o lo que desees saber..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <Send className="h-4 w-4" />
                  Enviar Pregunta Directa
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Embedded Google Maps frame map */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-neutral-900 mb-3 block">¿Dónde encontrarnos? Mapa de Localización</h2>
        <div className="rounded-3xl border border-brand-100 overflow-hidden shadow-sm bg-white p-2">
          <iframe
            src={CLINIC_INFO.mapEmbedUrl}
            width="100%"
            height="360"
            className="rounded-2xl border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localización de Kairos Logopedia en Madrid"
          />
        </div>
      </section>

      {/* Frequently Asked Questions accordion (FAQs) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-brand-600" />
            Preguntas Frecuentes (FAQs)
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Hemos reunido las dudas clínicas y operativas habituales de padres y adultos para ayudarte a aclararlas de inmediato de la mano de nuestros colegiados.
          </p>
        </div>

        {/* Categories selector block for FAQs */}
        <div className="flex flex-wrap justify-center gap-2">
          {(["todos", "general", "pediatria", "adultos"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFaqCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                faqCategory === cat
                  ? "bg-brand-500 text-white"
                  : "bg-white border border-brand-100 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {cat === "todos" && "Todos"}
              {cat === "general" && "General"}
              {cat === "pediatria" && "Logopedía Infantil"}
              {cat === "adultos" && "Adultos y Neuro"}
            </button>
          ))}
        </div>

        {/* FAQs list rendering as interactive expandable accordions */}
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = !!expandedFaqs[faq.id];
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-brand-100 p-1.5 transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between text-left px-4 py-3.5 hover:text-brand-700 font-display font-bold text-sm text-neutral-900 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-neutral-400 mt-0.5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4.5 pt-1.5 text-xs text-neutral-600 leading-relaxed font-semibold border-t border-brand-50/50 mt-1.5 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
