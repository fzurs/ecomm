from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0016_alter_customer_document_type'),
        ('store', '0020_product_vat_rate'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='vat_condition',
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, 'IVA Responsable Inscripto'),
                    (4, 'IVA Sujeto Exento'),
                    (5, 'Consumidor Final'),
                    (6, 'Responsable Monotributo'),
                    (7, 'Sujeto No Categorizado'),
                    (8, 'Proveedor del Exterior'),
                    (9, 'Cliente del Exterior'),
                    (10, 'IVA Liberado - Ley N° 19.640'),
                    (13, 'Monotributista Social'),
                    (15, 'IVA No Alcanzado'),
                    (16, 'Monotributo Trabajador Independiente Promovido'),
                ],
                default=5,
            ),
        ),
        migrations.AddField(
            model_name='customer',
            name='legal_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='customer',
            name='address',
            field=models.CharField(blank=True, max_length=255),
        ),
        # The existing items were sold at 21%, the products' default.
        migrations.AddField(
            model_name='orderitem',
            name='vat_rate',
            field=models.PositiveSmallIntegerField(
                blank=True,
                choices=[
                    (1, 'Non-taxed'), (2, 'Exempt'), (3, '0%'), (4, '10.5%'), (5, '21%'),
                    (6, '27%'), (8, '5%'), (9, '2.5%'),
                ],
                default=5,
            ),
            preserve_default=False,
        ),
    ]
