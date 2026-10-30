from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from django.utils.translation import ngettext


class MinimumLengthValidator(password_validation.MinimumLengthValidator):
    """A shorter minimum for the store's customers than for staff, who handle orders and
    invoices. Without a user (or with an unknown one) it takes the staff's: signing up passes a
    customer (`AccountAdapter.clean_password`), and the other validators still reject common,
    numeric and look-alike passwords."""

    def __init__(self, min_length=8, staff_min_length=12):
        super().__init__(min_length)
        self.staff_min_length = staff_min_length

    def min_length_for(self, user):
        return self.min_length if user is not None and not user.is_staff else self.staff_min_length

    def validate(self, password, user=None):
        min_length = self.min_length_for(user)
        if len(password) < min_length:
            raise ValidationError(
                ngettext(
                    'This password is too short. It must contain at least %(min_length)d character.',
                    'This password is too short. It must contain at least %(min_length)d characters.',
                    min_length,
                ),
                code='password_too_short',
                params={'min_length': min_length},
            )

    def get_help_text(self):
        return (
            f'Your password must contain at least {self.min_length} characters '
            f'({self.staff_min_length} for staff).'
        )
