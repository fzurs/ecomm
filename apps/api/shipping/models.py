from django.contrib.postgres.fields import ArrayField
from django.db import models


class Province(models.TextChoices):
    """Argentina's 24 jurisdictions, where an order can be sent."""
    CABA = "caba", "Ciudad Autónoma de Buenos Aires"
    BUENOS_AIRES = "buenos_aires", "Buenos Aires"
    CATAMARCA = "catamarca", "Catamarca"
    CHACO = "chaco", "Chaco"
    CHUBUT = "chubut", "Chubut"
    CORDOBA = "cordoba", "Córdoba"
    CORRIENTES = "corrientes", "Corrientes"
    ENTRE_RIOS = "entre_rios", "Entre Ríos"
    FORMOSA = "formosa", "Formosa"
    JUJUY = "jujuy", "Jujuy"
    LA_PAMPA = "la_pampa", "La Pampa"
    LA_RIOJA = "la_rioja", "La Rioja"
    MENDOZA = "mendoza", "Mendoza"
    MISIONES = "misiones", "Misiones"
    NEUQUEN = "neuquen", "Neuquén"
    RIO_NEGRO = "rio_negro", "Río Negro"
    SALTA = "salta", "Salta"
    SAN_JUAN = "san_juan", "San Juan"
    SAN_LUIS = "san_luis", "San Luis"
    SANTA_CRUZ = "santa_cruz", "Santa Cruz"
    SANTA_FE = "santa_fe", "Santa Fe"
    SANTIAGO_DEL_ESTERO = "santiago_del_estero", "Santiago del Estero"
    TIERRA_DEL_FUEGO = "tierra_del_fuego", "Tierra del Fuego"
    TUCUMAN = "tucuman", "Tucumán"


class ShippingZone(models.Model):
    """What sending an order to these provinces costs. A province is in one zone at most
    (`ShippingZoneSerializer` checks it); one in none can't be sent to."""

    name = models.CharField(max_length=100, unique=True)
    provinces = ArrayField(models.CharField(max_length=30, choices=Province.choices), default=list)
    # IVA included, like the prices.
    cost = models.PositiveIntegerField()
    # Free from this subtotal of the items, if set.
    free_from = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["cost", "name"]

    def __str__(self):
        return self.name
