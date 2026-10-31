from rest_framework import serializers

from .models import Province, ShippingZone


class ShippingZoneSerializer(serializers.ModelSerializer):
    provinces = serializers.ListField(
        child=serializers.ChoiceField(choices=Province.choices), allow_empty=False)

    class Meta:
        model = ShippingZone
        fields = ["id", "name", "provinces", "cost", "free_from"]

    def validate_provinces(self, provinces):
        provinces = list(dict.fromkeys(provinces))
        others = ShippingZone.objects.filter(provinces__overlap=provinces)
        if self.instance:
            others = others.exclude(pk=self.instance.pk)
        taken = {province: zone.name for zone in others for province in zone.provinces}
        clashes = [f"{Province(p).label} ({taken[p]})" for p in provinces if p in taken]
        if clashes:
            raise serializers.ValidationError(
                f"Already in another zone: {', '.join(clashes)}.")
        return provinces


class ShippingOptionsSerializer(serializers.Serializer):
    """What the store offers: the zones it ships to, and where to pick orders up (null if it
    doesn't offer it)."""
    zones = ShippingZoneSerializer(many=True)
    pickup_address = serializers.CharField(allow_null=True)
