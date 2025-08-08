import { Product } from "./types";

export const products: Product[] = [
  // Analgésicos
  {
    id: 1,
    title: "Ibuprofeno 600mg",
    description:
      "Analgésico y antiinflamatorio para dolores moderados a intensos",
    category: "Analgésicos",
    status: "Disponible",
    price: "$12.50",
    quantity: 45,
    last_update: new Date("2024-08-05"),
  },
  {
    id: 2,
    title: "Paracetamol 500mg",
    description: "Analgésico y antipirético para dolor y fiebre",
    category: "Analgésicos",
    status: "Disponible",
    price: "$8.75",
    quantity: 120,
    last_update: new Date("2024-08-06"),
  },
  {
    id: 3,
    title: "Aspirina 100mg",
    description: "Analgésico con acción anticoagulante",
    category: "Analgésicos",
    status: "Agotado",
    price: "$15.20",
    quantity: 0,
    last_update: new Date("2024-08-01"),
  },

  // Antihistamínicos
  {
    id: 4,
    title: "Loratadina 10mg",
    description: "Antihistamínico para alergias sin somnolencia",
    category: "Antihistamínicos",
    status: "Disponible",
    price: "$18.90",
    quantity: 35,
    last_update: new Date("2024-08-07"),
  },
  {
    id: 5,
    title: "Cetirizina 10mg",
    description: "Antihistamínico de segunda generación",
    category: "Antihistamínicos",
    status: "Disponible",
    price: "$22.40",
    quantity: 28,
    last_update: new Date("2024-08-06"),
  },

  // Antiinflamatorios
  {
    id: 6,
    title: "Diclofenaco Gel 1%",
    description: "Gel antiinflamatorio de uso tópico",
    category: "Antiinflamatorios",
    status: "Disponible",
    price: "$25.60",
    quantity: 18,
    last_update: new Date("2024-08-05"),
  },
  {
    id: 7,
    title: "Naproxeno 250mg",
    description: "Antiinflamatorio no esteroideo de larga duración",
    category: "Antiinflamatorios",
    status: "Disponible",
    price: "$19.80",
    quantity: 42,
    last_update: new Date("2024-08-07"),
  },

  // Antisépticos
  {
    id: 8,
    title: "Alcohol Etílico 70%",
    description: "Antiséptico para desinfección de heridas menores",
    category: "Antisépticos",
    status: "Disponible",
    price: "$6.50",
    quantity: 85,
    last_update: new Date("2024-08-06"),
  },
  {
    id: 9,
    title: "Povidona Yodada 10%",
    description: "Antiséptico de amplio espectro",
    category: "Antisépticos",
    status: "Disponible",
    price: "$11.20",
    quantity: 32,
    last_update: new Date("2024-08-05"),
  },

  // Cardiología
  {
    id: 10,
    title: "Enalapril 10mg",
    description: "Inhibidor ACE para hipertensión arterial",
    category: "Cardiología",
    status: "Disponible",
    price: "$28.70",
    quantity: 25,
    last_update: new Date("2024-08-07"),
  },
  {
    id: 11,
    title: "Atorvastatina 20mg",
    description: "Estatina para control del colesterol",
    category: "Cardiología",
    status: "Disponible",
    price: "$35.40",
    quantity: 15,
    last_update: new Date("2024-08-06"),
  },

  // Cuidado Personal
  {
    id: 12,
    title: "Champú Anticaspa",
    description: "Tratamiento para caspa y seborrea",
    category: "Cuidado Personal",
    status: "Disponible",
    price: "$24.90",
    quantity: 22,
    last_update: new Date("2024-08-05"),
  },
  {
    id: 13,
    title: "Protector Solar FPS 50",
    description: "Protección UV de amplio espectro",
    category: "Cuidado Personal",
    status: "Disponible",
    price: "$45.60",
    quantity: 38,
    last_update: new Date("2024-08-07"),
  },

  // Dispositivos Médicos
  {
    id: 14,
    title: "Termómetro Digital",
    description: "Termómetro clínico de lectura rápida",
    category: "Dispositivos Médicos",
    status: "Disponible",
    price: "$18.50",
    quantity: 12,
    last_update: new Date("2024-08-06"),
  },
  {
    id: 15,
    title: "Tensiómetro Digital",
    description: "Monitor de presión arterial automático",
    category: "Dispositivos Médicos",
    status: "Disponible",
    price: "$125.00",
    quantity: 6,
    last_update: new Date("2024-08-04"),
  },

  // Gastroenterología
  {
    id: 16,
    title: "Omeprazol 20mg",
    description: "Inhibidor de bomba de protones para acidez",
    category: "Gastroenterología",
    status: "Disponible",
    price: "$16.80",
    quantity: 55,
    last_update: new Date("2024-08-07"),
  },
  {
    id: 17,
    title: "Suero Oral Rehidratante",
    description: "Sales de rehidratación oral sabor naranja",
    category: "Gastroenterología",
    status: "Disponible",
    price: "$9.40",
    quantity: 48,
    last_update: new Date("2024-08-06"),
  },

  // Material de Curación
  {
    id: 18,
    title: "Vendas Elásticas 10cm",
    description: "Vendaje elástico para soporte muscular",
    category: "Material de Curación",
    status: "Disponible",
    price: "$14.30",
    quantity: 27,
    last_update: new Date("2024-08-05"),
  },
  {
    id: 19,
    title: "Gasas Estériles 5x5cm",
    description: "Gasas estériles para curación de heridas",
    category: "Material de Curación",
    status: "Disponible",
    price: "$8.90",
    quantity: 65,
    last_update: new Date("2024-08-07"),
  },

  // Medicamentos Respiratorios
  {
    id: 20,
    title: "Salbutamol Inhalador",
    description: "Broncodilatador para asma y EPOC",
    category: "Medicamentos Respiratorios",
    status: "Disponible",
    price: "$32.50",
    quantity: 19,
    last_update: new Date("2024-08-06"),
  },
  {
    id: 21,
    title: "Jarabe para la Tos",
    description: "Antitusivo y expectorante natural",
    category: "Medicamentos Respiratorios",
    status: "Disponible",
    price: "$21.70",
    quantity: 33,
    last_update: new Date("2024-08-05"),
  },

  // Protección Personal
  {
    id: 22,
    title: "Mascarillas KN95",
    description: "Respirador de protección personal",
    category: "Protección Personal",
    status: "Disponible",
    price: "$2.50",
    quantity: 200,
    last_update: new Date("2024-08-07"),
  },
  {
    id: 23,
    title: "Guantes de Nitrilo",
    description: "Guantes desechables sin látex",
    category: "Protección Personal",
    status: "Disponible",
    price: "$0.85",
    quantity: 150,
    last_update: new Date("2024-08-06"),
  },

  // Soluciones
  {
    id: 24,
    title: "Suero Fisiológico 250ml",
    description: "Solución salina estéril para irrigación",
    category: "Soluciones",
    status: "Disponible",
    price: "$7.20",
    quantity: 78,
    last_update: new Date("2024-08-07"),
  },
  {
    id: 25,
    title: "Agua Oxigenada 10 Vol",
    description: "Solución antiséptica de peróxido de hidrógeno",
    category: "Soluciones",
    status: "Disponible",
    price: "$4.80",
    quantity: 92,
    last_update: new Date("2024-08-05"),
  },

  // Vitaminas y Suplementos
  {
    id: 26,
    title: "Vitamina C 1000mg",
    description: "Suplemento de ácido ascórbico",
    category: "Vitaminas y Suplementos",
    status: "Disponible",
    price: "$18.60",
    quantity: 44,
    last_update: new Date("2024-08-06"),
  },
  {
    id: 27,
    title: "Complejo B",
    description: "Multivitamínico del complejo B",
    category: "Vitaminas y Suplementos",
    status: "Disponible",
    price: "$26.90",
    quantity: 31,
    last_update: new Date("2024-08-07"),
  },

  // Antibióticos
  {
    id: 28,
    title: "Amoxicilina 500mg",
    description: "Antibiótico de amplio espectro",
    category: "Antibióticos",
    status: "Disponible",
    price: "$24.50",
    quantity: 18,
    last_update: new Date("2024-08-05"),
  },

  // Dermatología
  {
    id: 29,
    title: "Crema Hidratante Facial",
    description: "Hidratante hipoalergénica para piel sensible",
    category: "Dermatología",
    status: "Disponible",
    price: "$38.70",
    quantity: 26,
    last_update: new Date("2024-08-06"),
  },

  // Diabetes
  {
    id: 30,
    title: "Tiras Reactivas Glucosa",
    description: "Tiras para medición de glucosa en sangre",
    category: "Diabetes",
    status: "Disponible",
    price: "$52.40",
    quantity: 15,
    last_update: new Date("2024-08-07"),
  },

  // Cuidado Infantil
  {
    id: 31,
    title: "Paracetamol Infantil Jarabe",
    description: "Analgésico y antipirético pediátrico",
    category: "Cuidado Infantil",
    status: "Disponible",
    price: "$13.80",
    quantity: 29,
    last_update: new Date("2024-08-05"),
  },

  // Ginecología
  {
    id: 32,
    title: "Test de Embarazo",
    description: "Prueba de embarazo de uso doméstico",
    category: "Ginecología",
    status: "Disponible",
    price: "$8.90",
    quantity: 25,
    last_update: new Date("2024-08-06"),
  },

  // Productos con stock bajo
  {
    id: 33,
    title: "Insulina Rápida",
    description: "Insulina de acción rápida para diabetes",
    category: "Diabetes",
    status: "Stock Bajo",
    price: "$89.50",
    quantity: 3,
    last_update: new Date("2024-08-04"),
  },
];
