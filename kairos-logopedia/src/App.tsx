import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import HomeView from "./components/HomeView";
import ServicesView from "./components/ServicesView";
import PediatricView from "./components/PediatricView";
import AdultsView from "./components/AdultsView";
import TeamView from "./components/TeamView";
import ContactView from "./components/ContactView";
import AppointmentsList from "./components/AppointmentsList";
import { AppView } from "./types";

export default function App() {
  const [currentView, setView] = useState<AppView>("inicio");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Specific scheduling initialization context
  const [bookingCategory, setBookingCategory] = useState<"infantil" | "adulto" | undefined>(undefined);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  
  // Local signal to trigger appointments table rerender on successful scheduling
  const [appointmentsRefresh, setAppointmentsRefresh] = useState(0);

  // Global triggers to pop up the booking modal scheduler
  const handleOpenGlobalBooking = (category?: "infantil" | "adulto", serviceId?: string) => {
    setBookingCategory(category);
    setBookingServiceId(serviceId);
    setIsBookingOpen(true);
  };

  const handleSelectServiceForBooking = (serviceId: string) => {
    handleOpenGlobalBooking(undefined, serviceId);
  };

  const handleBookingSuccess = () => {
    setAppointmentsRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50" id="kairos-app-container">
      
      {/* Reusable navigation header */}
      <Navbar
        currentView={currentView}
        setView={setView}
        openBooking={() => handleOpenGlobalBooking(undefined, undefined)}
      />

      {/* Main Content Render Layout */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === "inicio" && (
          <HomeView
            setView={setView}
            openBooking={() => handleOpenGlobalBooking(undefined, undefined)}
          />
        )}

        {currentView === "servicios" && (
          <ServicesView
            onSelectServiceForBooking={handleSelectServiceForBooking}
          />
        )}

        {currentView === "pediatria" && (
          <PediatricView
            onSelectServiceForBooking={handleSelectServiceForBooking}
            setView={(v) => {
              if (v === "servicios") setView("servicios");
              if (v === "contacto") setView("contacto");
            }}
          />
        )}

        {currentView === "adultos" && (
          <AdultsView
            onSelectServiceForBooking={handleSelectServiceForBooking}
            setView={(v) => {
              if (v === "servicios") setView("servicios");
              if (v === "contacto") setView("contacto");
            }}
          />
        )}

        {currentView === "equipo" && (
          <TeamView
            openBooking={() => handleOpenGlobalBooking(undefined, undefined)}
          />
        )}

        {currentView === "contacto" && (
          <ContactView />
        )}

        {currentView === "mis-citas" && (
          <AppointmentsList
            onOpenBooking={() => handleOpenGlobalBooking(undefined, undefined)}
            refreshTrigger={appointmentsRefresh}
          />
        )}

      </main>

      {/* Reusable footer */}
      <Footer
        setView={setView}
        openBooking={() => handleOpenGlobalBooking(undefined, undefined)}
      />

      {/* Global Interactive multi-step scheduler Popup */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialCategory={bookingCategory}
        initialServiceId={bookingServiceId}
        onSuccess={handleBookingSuccess}
      />

    </div>
  );
}
