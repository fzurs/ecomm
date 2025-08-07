import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  isToday,
  isYesterday,
  isTomorrow,
  parseISO,
  addDays,
  subDays,
  Locale,
} from "date-fns";
import { es } from "date-fns/locale";

// Clase para fechas humanizadas
export class HumanizedDate {
  private date: Date;

  constructor(date: string | Date = new Date()) {
    this.date = typeof date === "string" ? parseISO(date) : date;
  }

  // Formato relativo (hace 2 horas, mañana, etc.)
  getRelativeFormat(): string {
    return formatRelative(this.date, new Date(), { locale: es });
  }

  // Distancia desde ahora (hace 2 horas, en 3 días)
  getDistanceFromNow(): string {
    return formatDistanceToNow(this.date, {
      addSuffix: true,
      locale: es,
    });
  }

  // Distancia entre dos fechas
  getDistanceTo(targetDate: Date): string {
    return formatDistance(this.date, targetDate, {
      addSuffix: true,
      locale: es,
    });
  }

  // Formato amigable personalizado
  getFriendlyFormat(): string {
    if (isToday(this.date)) {
      return `Hoy a las ${format(this.date, "HH:mm")}`;
    }

    if (isYesterday(this.date)) {
      return `Ayer a las ${format(this.date, "HH:mm")}`;
    }

    if (isTomorrow(this.date)) {
      return `Mañana a las ${format(this.date, "HH:mm")}`;
    }

    // Para fechas más lejanas
    const now = new Date();
    const diffInDays = Math.abs(
      Math.floor((this.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (diffInDays <= 7) {
      return format(this.date, "EEEE 'a las' HH:mm", { locale: es });
    }

    if (diffInDays <= 365) {
      return format(this.date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
    }

    return format(this.date, "d 'de' MMMM 'de' yyyy", { locale: es });
  }

  // Formato completo en español
  getFullFormat(): string {
    return format(this.date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es,
    });
  }

  // Formato corto
  getShortFormat(): string {
    return format(this.date, "dd/MM/yyyy", { locale: es });
  }

  // Solo la hora
  getTimeOnly(): string {
    return format(this.date, "HH:mm");
  }

  // Obtener la fecha original
  getRawDate(): Date {
    return this.date;
  }
}

// Funciones de utilidad
export const dateUtils = {
  // Crear una fecha humanizada
  create: (date?: string | Date) => new HumanizedDate(date),

  // Formatear rápidamente una fecha
  quickFormat: (date: string | Date): string => {
    const humanDate = new HumanizedDate(date);
    return humanDate.getFriendlyFormat();
  },

  // Obtener tiempo relativo
  timeAgo: (date: string | Date): string => {
    const humanDate = new HumanizedDate(date);
    return humanDate.getDistanceFromNow();
  },

  // Formatear para mensajes/chat
  chatFormat: (date: string | Date): string => {
    const humanDate = new HumanizedDate(date);
    const dateObj = humanDate.getRawDate();

    if (isToday(dateObj)) {
      return humanDate.getTimeOnly();
    }

    if (isYesterday(dateObj)) {
      return "Ayer";
    }

    const now = new Date();
    const diffInDays = Math.abs(
      Math.floor((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (diffInDays <= 7) {
      return format(dateObj, "EEEE", { locale: es });
    }

    return format(dateObj, "dd/MM/yyyy", { locale: es });
  },
};

// Ejemplos de uso
export const examples = () => {
  const now = new Date();
  const yesterday = subDays(now, 1);
  const tomorrow = addDays(now, 1);
  const lastWeek = subDays(now, 7);

  console.log("=== Ejemplos de fechas humanizadas ===");

  // Usando la clase
  const todayDate = new HumanizedDate();
  console.log("Hoy - Formato amigable:", todayDate.getFriendlyFormat());
  console.log("Hoy - Formato completo:", todayDate.getFullFormat());
  console.log("Hoy - Relativo:", todayDate.getRelativeFormat());

  const yesterdayDate = new HumanizedDate(yesterday);
  console.log("Ayer - Formato amigable:", yesterdayDate.getFriendlyFormat());
  console.log(
    "Ayer - Tiempo transcurrido:",
    yesterdayDate.getDistanceFromNow()
  );

  // Usando las utilidades
  console.log("Mañana - Formato rápido:", dateUtils.quickFormat(tomorrow));
  console.log(
    "Semana pasada - Tiempo transcurrido:",
    dateUtils.timeAgo(lastWeek)
  );
  console.log("Hoy - Formato chat:", dateUtils.chatFormat(now));
  console.log("Ayer - Formato chat:", dateUtils.chatFormat(yesterday));
};

// Interfaz para configuración personalizada
export interface DateFormatOptions {
  showTime?: boolean;
  showYear?: boolean;
  shortFormat?: boolean;
  locale?: Locale;
}

// Función personalizable
export const formatHumanDate = (
  date: string | Date,
  options: DateFormatOptions = {}
): string => {
  const {
    showTime = true,
    showYear = true,
    shortFormat = false,
    locale = es,
  } = options;

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const currentYear = new Date().getFullYear();
  const dateYear = dateObj.getFullYear();
  const isDifferentYear = dateYear !== currentYear;

  if (shortFormat) {
    if (showYear || isDifferentYear) {
      return format(dateObj, showTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", {
        locale,
      });
    }
    return format(dateObj, showTime ? "dd/MM HH:mm" : "dd/MM", { locale });
  }

  let formatString = "";

  if (isToday(dateObj)) {
    formatString = showTime ? "'Hoy a las' HH:mm" : "'Hoy'";
  } else if (isYesterday(dateObj)) {
    formatString = showTime ? "'Ayer a las' HH:mm" : "'Ayer'";
  } else if (isTomorrow(dateObj)) {
    formatString = showTime ? "'Mañana a las' HH:mm" : "'Mañana'";
  } else {
    // Mostrar año si está habilitado showYear o si es un año diferente al actual
    if (showYear || isDifferentYear) {
      formatString = showTime
        ? "d 'de' MMMM 'de' yyyy 'a las' HH:mm"
        : "d 'de' MMMM 'de' yyyy";
    } else {
      formatString = showTime ? "d 'de' MMMM 'a las' HH:mm" : "d 'de' MMMM";
    }
  }

  return format(dateObj, formatString, { locale });
};
