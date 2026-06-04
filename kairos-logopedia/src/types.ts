/**
 * Type declarations for Kairos Logopedia
 */

export type AppView = 
  | 'inicio' 
  | 'servicios' 
  | 'pediatria' 
  | 'adultos' 
  | 'equipo' 
  | 'contacto' 
  | 'mis-citas';

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  description: string;
  category: 'infantil' | 'adulto';
  iconName: string; // Identifier to map to Lucide icons
  indications: string[]; // Signs that a patient might need this service
  treatments: string[]; // What we do during therapy
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  collegiateNumber?: string;
  image: string;
  specialties: string[];
}

export interface Appointment {
  id: string;
  patientName: string;
  guardianName?: string; // Standard for children
  patientAge: number;
  email: string;
  phone: string;
  serviceCategory: 'infantil' | 'adulto';
  serviceType: string; // e.g., "Retraso del Lenguaje", "Afasia"
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 - 11:00"
  notes?: string;
  createdAt: string;
  status: 'pendiente' | 'confirmada' | 'cancelada';
}

export interface Testimonial {
  id: string;
  name: string;
  relation?: string; // "Madre de Leo", "Paciente de Afasia" etc.
  rating: number;
  text: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pediatria' | 'adultos' | 'citas';
}
