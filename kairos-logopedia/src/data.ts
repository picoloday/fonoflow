import { ServiceItem, TeamMember, Testimonial, FaqItem } from "./types";

export const CLINIC_INFO = {
  name: "Kairos Logopedia",
  slogan: "Mucho más que hablar",
  tagline: "Clínica de Logopedia Especializada en Infancia y Adultos. Creemos en la comunicación sin barreras, adaptando cada intervención a tu ritmo y necesidades.",
  phone: "+34 612 345 678",
  phoneFormatted: "612 345 678",
  email: "info@kairoslogopedia.com",
  address: "Calle de Alcalá, 154, 1º Derecha",
  postalCode: "28009",
  city: "Madrid",
  schedule: "Lunes a Viernes de 10:00 a 20:00. Sábados con cita previa.",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1d3037.1235487693247!2d-3.6738914234031647!3d40.428258354924776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4228965f7c3fb3%3A0x6bba59bc6b306b3f!2sC.%20de%20Alcal%C3%A1%2C%20154%2C%2028009%20Madrid!5e0!3m2!1ses!2ses!4v1716500000000!5m2!1ses!2ses",
};

export const SERVICES_DATA: ServiceItem[] = [
  // Pediatric services
  {
    id: "ped-lenguaje",
    title: "Retraso del Lenguaje y Expresión",
    shortDesc: "Intervención temprana para niños que tardan en hablar o con dificultades expresivas.",
    description: "Evaluación e intervención personalizada para niños que muestran un inicio tardío del habla o dificultades en la estructuración de frases y vocabulario. Trabajamos de manera lúdica para potenciar el vocabulario, la gramática y el uso comunicativo del lenguaje.",
    category: "infantil",
    iconName: "Baby",
    indications: [
      "Niño de 2 años que aún no dice palabras aisladas o no imita.",
      "Niño de 3 años que no formula frases sencillas de dos o tres palabras.",
      "Usa gestos constantes en lugar de palabras para pedir cosas.",
      "Dificultades comprensivas ante órdenes sencillas."
    ],
    treatments: [
      "Estimulación temprana del lenguaje a través del juego dirigido.",
      "Enriquecimiento de vocabulario y estructuras gramaticales.",
      "Asesoramiento integral a la familia para pautas de estimulación en el hogar.",
      "Desarrollo de habilidades de pragmática (intención comunicativa)."
    ]
  },
  {
    id: "ped-aprendizaje",
    title: "Dificultades de Aprendizaje y Lectoescritura",
    shortDesc: "Abordaje integral de dislexia, disgrafía, disortografía y comprensión lectora.",
    description: "Evaluación y tratamiento de las dificultades vinculadas con el rendimiento escolar. Nos enfocamos en dotar al niño de herramientas y rutas cognitivas alternativas para superar barreras en el aprendizaje de la lectura, escritura y el procesamiento de la información.",
    category: "infantil",
    iconName: "BookOpen",
    indications: [
      "Lectura silabeante, lenta, o con pérdida frecuente de la línea.",
      "Confusión de letras similares al leer o escribir (b/d, p/q).",
      "Dificultad severa en la ortografía o caligrafía ilegible.",
      "Problemas para comprender el significado de lo que lee."
    ],
    treatments: [
      "Estimulación de la conciencia fonológica y de las rutas visual y fonológica de lectura.",
      "Entrenamiento intensivo en comprensión lectora y técnicas de estructuración de textos.",
      "Técnicas de reeducación de la disgrafía y disortografía adaptadas al nivel escolar.",
      "Coordinación estrecha con los orientadores escolares y profesores del menor."
    ]
  },
  {
    id: "ped-miofuncional",
    title: "Terapia Miofuncional Infantil (TMF)",
    shortDesc: "Corrección de deglución atípica, respiración bucal y disfunciones orofaciales.",
    description: "Prevención, diagnóstico y corrección de las disfunciones musculares de la boca, cara y cuello que afectan al habla, la masticación, la respiración o la deglución. A menudo coordinada con tratamientos de ortodoncia.",
    category: "infantil",
    iconName: "Activity",
    indications: [
      "El niño coloca la lengua entre los dientes al tragar (deglución atípica).",
      "Respira continuamente por la boca con los labios entreabiertos.",
      "Dificultad para masticar alimentos sólidos o masticación lenta.",
      "Uso prolongado del chupete, mamadera o hábito de chuparse el dedo."
    ],
    treatments: [
      "Reeducación muscular mediante ejercicios de praxias linguales y labiales.",
      "Instauración del patrón respiratorio nasal y de sellado labial pasivo.",
      "Corrección del patrón deglutorio y coordinación de la masticación.",
      "Terapia pre y postoperatoria de frenillo lingual (frenectomía)."
    ]
  },
  {
    id: "ped-desarrollo",
    title: "Trastornos del Neurodesarrollo (TEA, TDAH)",
    shortDesc: "Habilidades de comunicación social y apoyo al lenguaje en TEA y TDAH.",
    description: "Intervención especializada para potenciar las habilidades comunicativo-lingüísticas y de interacción y juego en menores diagnosticados con TEA (Trastorno del Espectro Autista), TDAH (Trastorno por Déficit de Atención e Hiperactividad) u otras condiciones neurológicas.",
    category: "infantil",
    iconName: "Brain",
    indications: [
      "Ausencia o escaso contacto visual durante el diálogo.",
      "Ecolalia (repetición literal de frases o anuncios fuera de contexto).",
      "Poco interés en interactuar, compartir juego o escasa atención conjunta.",
      "Dificultad extrema para mantener el tema de conversación o interpretar gestos."
    ],
    treatments: [
      "Implementación de Sistemas Aumentativos y Alternativos de Comunicación (SAAC) como PECS o software dinámico.",
      "Desarrollo de habilidades de teoría de la mente y pragmática social.",
      "Entrenamiento en habilidades conversacionales y juego interactivo.",
      "Estructuración del entorno y adaptaciones sensoriales para facilitar el aprendizaje."
    ]
  },
  {
    id: "ped-habla",
    title: "Trastornos del Habla (Dislalias y Fluidez)",
    shortDesc: "Corrección en la pronunciación de fonemas (rotacismo, etc.) y tartamudez infantil.",
    description: "Diagnóstico y rehabilitación de los errores sistemáticos en la producción de los sonidos del habla (letras difíciles como la 'R', 'S', 'D') y detección temprana de bloqueos o repeticiones silábicas anormales para prevenir la tartamudez crónica.",
    category: "infantil",
    iconName: "MessageCircle",
    indications: [
      "Sustitución de sonidos (ej: dice 'pelo' en lugar de 'perro', 'tasa' por 'casa').",
      "Incomprensión del habla fuera del núcleo familiar.",
      "Bloqueos notorios al empezar las frases, tensiones musculares en la cara al hablar.",
      "Prolongaciones excesivas de las primeras sílabas de las palabras."
    ],
    treatments: [
      "Puntos de articulación de fonemas mediante refuerzos cinestésicos y visuales.",
      "Ejercicios de discriminación auditiva selectiva de sonidos.",
      "Técnicas de control de la tensión y modelado de la fluidez infantil (Lidcombe / indirectas).",
      "Fomento de la seguridad comunicativa y reducción del miedo a errar."
    ]
  },

  // Adult services
  {
    id: "adu-afasia",
    title: "Rehabilitación en Afasia y Daño Cerebral",
    shortDesc: "Rehabilitación del habla, lectura y comprensión tras un Ictus o traumatismo.",
    description: "Terapia de lenguaje integral dirigida a pacientes que han sufrido una lesión cerebral adquirida (sea por ictus, traumatismo o tumores) y que experimentan pérdida en su capacidad de comprender, expresarse, leer o escribir.",
    category: "adulto",
    iconName: "Activity",
    indications: [
      "Dificultad extrema para encontrar las palabras que quiere decir ('lo tengo en la punta de la lengua' constante).",
      "Sustitución de palabras o sonidos incorrectos al hablar ('mesa' por 'silla').",
      "Pérdida de la capacidad de comprender lo que le dicen otras personas.",
      "Incapacidad para leer o escribir de manera autónoma tras el accidente."
    ],
    treatments: [
      "Terapia de inducción forzada del lenguaje y reactivación semántica-fonológica.",
      "Ejercicios de denominación, formulación de frases y agilidad argumental.",
      "Entrenamiento en comprensión oral-auditiva y lectura comprensiva.",
      "Diseño y entrenamiento de tableros de comunicación asistida o digitales en casos severos."
    ]
  },
  {
    id: "adu-disfagia",
    title: "Disfagia y Trastornos de la Deglución",
    shortDesc: "Seguridad y efectividad en la alimentación de forma cómoda y sin riesgos.",
    description: "Evaluación exhaustiva de los riesgos de aspiración alimentaria al pulmón. Ofrecemos herramientas, maniobras compensatorias y rehabilitación muscular orofaríngea para garantizar que el paciente se alimente por vía oral de forma completamente segura y libre de riesgos de neumonías.",
    category: "adulto",
    iconName: "Utensils",
    indications: [
      "Tos o carraspera persistente durante la comida o tras beber agua.",
      "Sensación de alimento atascado en la garganta.",
      "Infecciones respiratorias o neumonías repetitivas sin causa clara.",
      "Pérdida de peso injustificada por miedo o fatiga excesiva al comer."
    ],
    treatments: [
      "Maniobras deglutorias compensatorias y adaptaciones posturales de seguridad.",
      "Determinación y prescripción precisa de adaptaciones de texturas (espesantes, triturados).",
      "Estimulación termo-táctil y ejercicios de fortalecimiento laríngeo-lingual.",
      "Guías de alimentación segura y pautas preventivas detalladas para el cuidador doméstico."
    ]
  },
  {
    id: "adu-voz",
    title: "Trastornos de la Voz (Disfonías)",
    shortDesc: "Higiene vocal y recuperación de cuerdas vocales para docentes, cantantes y público en general.",
    description: "Tratamiento de alteraciones de la voz ocasionadas por abuso o mal uso vocal (nódulos, pólipos) o de origen orgánico/neurológico (parálisis de cuerdas vocales, post-tiroidectomía). Dirigido especialmente a profesionales que usan su voz como herramienta de trabajo diaria.",
    category: "adulto",
    iconName: "Music",
    indications: [
      "Ronquera de más de dos semanas de evolución sin proceso gripal.",
      "Fatiga y dolor en la laringe tras hablar durante períodos cortos.",
      "Pérdida súbita o progresiva de la potencia y el tono vocal confortable.",
      "Sensación perenne de tener cuerpos extraños en la laringe (tensión)."
    ],
    treatments: [
      "Terapia de Resonancia Vocal y del Tracto Vocal Semiocluido (SOVTE).",
      "Instauración de pautas estrictas de Higiene Vocal para el desgaste profesional.",
      "Reeducación del patrón respiratorio adaptado (respiración diafragmática).",
      "Coordinación y rehabilitación pre y postquirúrgica de cuerdas vocales."
    ]
  },
  {
    id: "adu-neuro",
    title: "Enfermedades Neurodegenerativas",
    shortDesc: "Mantenimiento comunicativo y de deglución en Parkinson, ELA y demencias.",
    description: "Intervención terapéutica continuada dirigida a enlentecer el ritmo de deterioro de la voz (disartria), el lenguaje y las funciones deglutorias en pacientes diagnosticados con patologías como el Parkinson, Esclerosis Lateral Amiotrófica (ELA), o demencias en fases iniciales y moderadas.",
    category: "adulto",
    iconName: "ShieldAlert",
    indications: [
      "La voz se ha vuelto extremadamente bajita, monótona u opaca (Parkinson).",
      "Habla arrastrada o pastosa ('como si estuviera bajo efectos del alcohol').",
      "Dificultades intermitentes de compresión o pérdida de coherencia del relato.",
      "Atragantamientos frecuentes con líquidos del grifo."
    ],
    treatments: [
      "Implementación del método de tratamiento vocal LSVT LOUD (Lee Silverman).",
      "Técnicas de articulación exagerada y compensaciones respiratorias de volumen.",
      "Estimulación cognitiva del lenguaje, memoria de trabajo y fluidez verbal semántica.",
      "Acompañamiento y soporte progresivo para conservar la máxima autonomía posible."
    ]
  },
  {
    id: "adu-tartamudez",
    title: "Fluidez del Habla en Adultos (Disfemia)",
    shortDesc: "Herramientas de control del habla y trabajo emocional ante la tartamudez activa.",
    description: "Estrategias personalizadas para el manejo de los bloqueos, suavizado de tensiones e intervenciones conductuales sobre la tartamudez en el adulto. Trabajamos de manera integral contemplando tanto los aspectos puramente motores del habla como la ansiedad y el estrés situacional.",
    category: "adulto",
    iconName: "ShieldAlert",
    indications: [
      "Evitación de situaciones sociales o telefónicas por temor a bloquearse.",
      "Bloqueos del habla prolongados acompañados de tics o movimientos corporales.",
      "Tensión laríngea notable al emitir respuestas breves obligatorias.",
      "Uso habitual de sinónimos rebuscados para esquivar letras temidas."
    ],
    treatments: [
      "Técnicas de modelado de la fluidez (inicio de fonación suave, prolongación silábica).",
      "Estrategias de modificación de la tartamudez (desensibilización, tartamudez voluntaria).",
      "Terapia cognitivo-conductual aplicada al miedo escénico y a la ansiedad de hablar.",
      "Participación opcional en grupos de ayuda mutua e interactividad dialogada."
    ]
  }
];

export const TEAM_MEMBERS_DATA: TeamMember[] = [
  {
    id: "ana-sanz",
    name: "Ana Sanz Guerrero",
    role: "Fundadora y Logopeda Especialista de Adultos",
    collegiateNumber: "Col. nº 28/1423",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
    bio: "Graduada en Logopedia por la Universidad Complutense de Madrid con Máster en Neurologopedia y daño cerebral adquirido. Cuenta con más de 10 años de experiencia clínica rehabilitando a pacientes con afasia, disfagia y patologías de la voz.",
    specialties: ["Neurologopedia", "Disfagia", "Rehabilitación de la Voz", "Daño Cerebral Adquirido"]
  },
  {
    id: "lucia-ortega",
    name: "Lucía Ortega Alarcón",
    role: "Logopeda Especialista Infantil",
    collegiateNumber: "Col. nº 28/2085",
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=600&auto=format&fit=crop",
    bio: "Graduada en Logopedia por la Universidad de Málaga, especializada en Atención Temprana y Trastornos de la Lectoescritura. Es una apasionada de conseguir que el aprendizaje sea un juego y una vía de superación sin estrés para las familias.",
    specialties: ["Estimulación Temprana", "Dislexia y Lectoescritura", "Trastornos del Habla", "TEA"]
  },
  {
    id: "carlos-pina",
    name: "Carlos Piña Santos",
    role: "Especialista en Terapia Miofuncional y Fluidez",
    collegiateNumber: "Col. nº 28/1932",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
    bio: "Graduado en Logopedia por la Universidad Autónoma de Barcelona con posgrado en Motricidad Orofacial y Terapia Miofuncional. Experto en reeducación de la deglución atípica y en el tratamiento de la tartamudez en niños y adultos.",
    specialties: ["Terapia Miofuncional (TMF)", "Deglución Atípica", "Tartamudez (Disfemia)", "Voz Profesional"]
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "test-1",
    name: "Elena García",
    relation: "Madre de Leo (5 años)",
    rating: 5,
    text: "Llevamos a Leo con Lucía por un retraso del lenguaje importante. No solo ha avanzado muchísimo y ahora se comunica de manera fantástica, sino que le encanta ir a terapia. Para él es su momento de juego favorito de la semana. ¡Increíble trabajo de Kairos!"
  },
  {
    id: "test-2",
    name: "Andrés Montero",
    relation: "Paciente recuperado de Ictus (62 años)",
    rating: 5,
    text: "Tras mi accidente cerebrovascular perdí casi todo el vocabulario y no era capaz de articular dos palabras seguidas. La paciencia de Ana Sanz y su rehabilitación con neurologopedia me han devuelto la posibilidad de dialogar con mis hijos y nietos. Estaré eternamente agradecido."
  },
  {
    id: "test-3",
    name: "Marta Rodríguez",
    relation: "Profesora de Secundaria (34 años)",
    rating: 5,
    text: "Afectada por nódulos vocales constantes, estuve a punto de pedir baja permanente. Carlos me enseñó ejercicios de resonancia y cuidado de la voz excepcionales. Ahora doy clase durante horas sin forzar la garganta. Profesionalidad absoluta."
  },
  {
    id: "test-4",
    name: "Francisco de Andrés",
    relation: "Padre de Jimena (8 años)",
    rating: 5,
    text: "Vinimos por sospechas de dislexia en el colegio que le causaban mucha frustración y malas notas. Desde el primer día hicieron un diagnóstico amigable y nos dieron herramientas coordinadas con su orientador escolar. Jimena ha recuperado la autoconfianza y adora leer."
  }
];

export const FAQS_DATA: FaqItem[] = [
  {
    id: "faq-1",
    question: "¿Cuánto dura cada sesión de logopedia y con qué frecuencia se realizan?",
    answer: "Nuestras sesiones estándar duran 45 minutos. Los últimos 5 minutos de la sesión se dedican a comentar pautas con los padres o cuidadores e informar sobre la evolución. Por lo general, la frecuencia inicial recomendada es de 1 o 2 sesiones semanales, dependiendo de la gravedad de la patología y de la valoración diagnóstica inicial.",
    category: "general"
  },
  {
    id: "faq-2",
    question: "¿Cómo sé si mi hijo necesita acudir a un logopeda?",
    answer: "Hay varios signos de alarma según la edad. Con 2 años, si hay ausencia de lenguaje hablado o nulo interés por imitar. A los 3-4 años, si su habla es ininteligible para personas ajenas a la familia, o si comete muchos errores al tragar o respira habitualmente con la boca abierta. Ante cualquier duda, una evaluación preventiva a tiempo evita que la dificultad se consolide.",
    category: "pediatria"
  },
  {
    id: "faq-3",
    question: "¿Se puede recuperar el habla después de un ictus en pacientes mayores?",
    answer: "Sí, absolutamente. El cerebro tiene la capacidad de reorganizarse mediante neuroplasticidad. No obstante, la precocidad del tratamiento es determinante: cuanto antes se inicie la neurologopedia tras el ictus, mayores y más rápidos serán los avances expresivos, cognitivos y de comprensión oral.",
    category: "adultos"
  },
  {
    id: "faq-4",
    question: "¿Cómo funciona el proceso de primera cita y evaluación en Kairos?",
    answer: "El proceso es simple: puedes solicitar una cita a través del botón 'Pedir Cita'. En el primer encuentro, realizamos una entrevista clínica profunda y las primeras pruebas diagnósticas. Posteriormente, redactamos un informe clínico completo con el diagnóstico colegiado y la propuesta de plan de terapia personalizada, especificando objetivos concretos de rehabilitación.",
    category: "citas"
  },
  {
    id: "faq-5",
    question: "¿Ofrecéis pautas de intervención o ejercicios para realizar en casa?",
    answer: "Sí. Consideramos que la implicación de la familia o del cuidador es un pilar fundamental en el éxito de cualquier tratamiento de terapia. En cada sesión programamos pequeñas directrices lúdicas de 5 a 10 minutos para practicar en el día a día sin abrumar al paciente, acelerando de este modo la generalización de los avances.",
    category: "general"
  }
];

export const AVAILABLE_TIME_SLOTS = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00"
];
