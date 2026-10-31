import type { Province } from "@workspace/api-client"

// Keyed by the generated enum (shipping.models.Province): a new one fails the
// typecheck until it has its name here.
export const provinces: Record<Province, string> = {
  caba: "Ciudad Autónoma de Buenos Aires",
  buenos_aires: "Buenos Aires",
  catamarca: "Catamarca",
  chaco: "Chaco",
  chubut: "Chubut",
  cordoba: "Córdoba",
  corrientes: "Corrientes",
  entre_rios: "Entre Ríos",
  formosa: "Formosa",
  jujuy: "Jujuy",
  la_pampa: "La Pampa",
  la_rioja: "La Rioja",
  mendoza: "Mendoza",
  misiones: "Misiones",
  neuquen: "Neuquén",
  rio_negro: "Río Negro",
  salta: "Salta",
  san_juan: "San Juan",
  san_luis: "San Luis",
  santa_cruz: "Santa Cruz",
  santa_fe: "Santa Fe",
  santiago_del_estero: "Santiago del Estero",
  tierra_del_fuego: "Tierra del Fuego",
  tucuman: "Tucumán",
}

export const provinceOptions = (Object.keys(provinces) as Province[])
  .map((value) => ({ value, label: provinces[value] }))
  .sort((a, b) => a.label.localeCompare(b.label, "es"))
