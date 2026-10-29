"""A voucher with a CAE is a fiscal record: the database refuses to delete it or change what ARCA
authorized, and freezes its lines and IVA, whatever the caller (API, Django admin, shell, SQL).
Only `error_message`, `arca_errors`, `observations` and `updated_at` stay writable.

A transaction that runs `SET LOCAL ecomm.allow_invoice_purge = 'on'`
(`billing.purge.bypass_invoice_guard`) skips the checks: the development seed uses it to backdate
its sample vouchers and to delete them, and the homologation ones on request.
"""
from django.db import migrations

SQL = """
CREATE FUNCTION billing_purge_allowed() RETURNS boolean AS $$
    SELECT coalesce(current_setting('ecomm.allow_invoice_purge', true), '') = 'on';
$$ LANGUAGE sql STABLE;

CREATE FUNCTION billing_invoice_guard() RETURNS trigger AS $$
BEGIN
    IF OLD.cae = '' OR billing_purge_allowed() THEN
        RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
    END IF;
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Voucher % has a CAE: it can''t be deleted, only credited.', OLD.id
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF ROW(OLD.order_id, OLD.associated_invoice_id, OLD.point_of_sale, OLD.voucher_type,
           OLD.number, OLD.issue_date, OLD.receptor_name, OLD.receptor_document_type,
           OLD.receptor_document_number, OLD.receptor_vat_condition, OLD.receptor_address,
           OLD.net_amount, OLD.vat_amount, OLD.exempt_amount, OLD.non_taxed_amount,
           OLD.total_amount, OLD.cae, OLD.cae_expiration_date, OLD.status, OLD.arca_response)
       IS DISTINCT FROM
       ROW(NEW.order_id, NEW.associated_invoice_id, NEW.point_of_sale, NEW.voucher_type,
           NEW.number, NEW.issue_date, NEW.receptor_name, NEW.receptor_document_type,
           NEW.receptor_document_number, NEW.receptor_vat_condition, NEW.receptor_address,
           NEW.net_amount, NEW.vat_amount, NEW.exempt_amount, NEW.non_taxed_amount,
           NEW.total_amount, NEW.cae, NEW.cae_expiration_date, NEW.status, NEW.arca_response)
    THEN
        RAISE EXCEPTION 'Voucher % has a CAE: what ARCA authorized can''t change.', OLD.id
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Lines and IVA: any insert, update or delete under a voucher with a CAE.
CREATE FUNCTION billing_invoice_child_guard() RETURNS trigger AS $$
DECLARE
    row_invoice_id bigint;
BEGIN
    IF billing_purge_allowed() THEN
        RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
    END IF;
    FOREACH row_invoice_id IN ARRAY CASE TG_OP
        WHEN 'INSERT' THEN ARRAY[NEW.invoice_id]
        WHEN 'DELETE' THEN ARRAY[OLD.invoice_id]
        ELSE ARRAY[OLD.invoice_id, NEW.invoice_id] END
    LOOP
        IF EXISTS (SELECT 1 FROM billing_invoice WHERE id = row_invoice_id AND cae <> '') THEN
            RAISE EXCEPTION 'Voucher % has a CAE: its % rows can''t change.', row_invoice_id, TG_TABLE_NAME
                USING ERRCODE = 'integrity_constraint_violation';
        END IF;
    END LOOP;
    RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billing_invoice_guard BEFORE UPDATE OR DELETE ON billing_invoice
    FOR EACH ROW EXECUTE FUNCTION billing_invoice_guard();
CREATE TRIGGER billing_invoiceline_guard BEFORE INSERT OR UPDATE OR DELETE ON billing_invoiceline
    FOR EACH ROW EXECUTE FUNCTION billing_invoice_child_guard();
CREATE TRIGGER billing_invoicevat_guard BEFORE INSERT OR UPDATE OR DELETE ON billing_invoicevat
    FOR EACH ROW EXECUTE FUNCTION billing_invoice_child_guard();
"""

REVERSE_SQL = """
DROP TRIGGER billing_invoicevat_guard ON billing_invoicevat;
DROP TRIGGER billing_invoiceline_guard ON billing_invoiceline;
DROP TRIGGER billing_invoice_guard ON billing_invoice;
DROP FUNCTION billing_invoice_child_guard();
DROP FUNCTION billing_invoice_guard();
DROP FUNCTION billing_purge_allowed();
"""


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0010_invoiceline_order_item_protect'),
    ]

    operations = [migrations.RunSQL(SQL, REVERSE_SQL)]
