from decimal import Decimal

import django.db.models.deletion
from django.db import migrations, models


STATUSES = {'success': 'authorized', 'error': 'rejected'}


def forwards(apps, schema_editor):
    Invoice = apps.get_model('billing', 'Invoice')
    for old, new in STATUSES.items():
        Invoice.objects.filter(status=old).update(status=new)
    # Stored as YYYYMMDD, which Postgres casts to a date; an empty one can't be cast.
    Invoice.objects.filter(cae_expiration_date='').update(cae_expiration_date=None)


def backwards(apps, schema_editor):
    Invoice = apps.get_model('billing', 'Invoice')
    for old, new in STATUSES.items():
        Invoice.objects.filter(status=new).update(status=old)
    Invoice.objects.filter(status__in=['unverified']).update(status='error')


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0007_remove_invoice_public_id'),
        ('orders', '0017_customer_fiscal_data_orderitem_vat_rate'),
    ]

    operations = [
        migrations.RemoveConstraint(model_name='invoice', name='unique_afip_invoice'),
        migrations.RemoveConstraint(
            model_name='invoicesequencelock', name='unique_invoice_sequence_lock'),
        migrations.RenameField(model_name='invoice', old_name='invoice_type', new_name='voucher_type'),
        migrations.RenameField(model_name='invoice', old_name='invoice_number', new_name='number'),
        migrations.RenameField(model_name='invoice', old_name='afip_response', new_name='arca_response'),
        migrations.RenameField(
            model_name='invoicesequencelock', old_name='invoice_type', new_name='voucher_type'),
        migrations.AlterField(
            model_name='invoice',
            name='cae_expiration_date',
            field=models.CharField(blank=True, max_length=8, null=True),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('authorized', 'Authorized'),
                    ('rejected', 'Rejected'),
                    ('unverified', 'Unverified'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name='invoice',
            name='cae_expiration_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='voucher_type',
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, 'Factura A'),
                    (2, 'Nota de Débito A'),
                    (3, 'Nota de Crédito A'),
                    (6, 'Factura B'),
                    (7, 'Nota de Débito B'),
                    (8, 'Nota de Crédito B'),
                    (11, 'Factura C'),
                    (12, 'Nota de Débito C'),
                    (13, 'Nota de Crédito C'),
                ]
            ),
        ),
        migrations.AlterField(
            model_name='invoicesequencelock',
            name='voucher_type',
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, 'Factura A'),
                    (2, 'Nota de Débito A'),
                    (3, 'Nota de Crédito A'),
                    (6, 'Factura B'),
                    (7, 'Nota de Débito B'),
                    (8, 'Nota de Crédito B'),
                    (11, 'Factura C'),
                    (12, 'Nota de Débito C'),
                    (13, 'Nota de Crédito C'),
                ]
            ),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='number',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='invoice',
            name='associated_invoice',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='notes',
                to='billing.invoice',
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='issue_date',
            field=models.DateField(blank=True, null=True),
        ),
        # Invoices before this migration were all to an unidentified final consumer.
        migrations.AddField(
            model_name='invoice',
            name='receptor_name',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='invoice',
            name='receptor_document_type',
            field=models.PositiveSmallIntegerField(
                choices=[(80, 'CUIT'), (86, 'CUIL'), (96, 'DNI'), (99, 'Sin identificar')],
                default=99,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='invoice',
            name='receptor_document_number',
            field=models.CharField(blank=True, max_length=11),
        ),
        migrations.AddField(
            model_name='invoice',
            name='receptor_vat_condition',
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
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='invoice',
            name='receptor_address',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='invoice',
            name='exempt_amount',
            field=models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12),
        ),
        migrations.AddField(
            model_name='invoice',
            name='non_taxed_amount',
            field=models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='net_amount',
            field=models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='vat_amount',
            field=models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='total_amount',
            field=models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12),
        ),
        migrations.AddField(
            model_name='invoice',
            name='arca_errors',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='invoice',
            name='observations',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name='InvoiceLine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=255)),
                ('quantity', models.PositiveIntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('vat_rate', models.PositiveSmallIntegerField(choices=[
                    (1, 'Non-taxed'), (2, 'Exempt'), (3, '0%'), (4, '10.5%'), (5, '21%'),
                    (6, '27%'), (8, '5%'), (9, '2.5%'),
                ])),
                ('credited_line', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.PROTECT,
                    related_name='credits', to='billing.invoiceline')),
                ('invoice', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, related_name='lines',
                    to='billing.invoice')),
                ('order_item', models.ForeignKey(
                    blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                    related_name='invoice_lines', to='orders.orderitem')),
            ],
            options={'ordering': ['id']},
        ),
        migrations.CreateModel(
            name='InvoiceVat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rate', models.PositiveSmallIntegerField(choices=[
                    (1, 'Non-taxed'), (2, 'Exempt'), (3, '0%'), (4, '10.5%'), (5, '21%'),
                    (6, '27%'), (8, '5%'), (9, '2.5%'),
                ])),
                ('base', models.DecimalField(decimal_places=2, max_digits=12)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('invoice', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, related_name='vat',
                    to='billing.invoice')),
            ],
            options={'ordering': ['rate']},
        ),
        migrations.AddConstraint(
            model_name='invoice',
            constraint=models.UniqueConstraint(
                condition=models.Q(number__isnull=False),
                fields=('point_of_sale', 'voucher_type', 'number'),
                name='unique_afip_invoice',
            ),
        ),
        migrations.AddConstraint(
            model_name='invoice',
            constraint=models.UniqueConstraint(
                condition=models.Q(associated_invoice__isnull=True) & ~models.Q(status='rejected'),
                fields=('order',),
                name='one_invoice_per_order',
            ),
        ),
        migrations.AddConstraint(
            model_name='invoicesequencelock',
            constraint=models.UniqueConstraint(
                fields=('point_of_sale', 'voucher_type'), name='unique_invoice_sequence_lock'),
        ),
    ]
