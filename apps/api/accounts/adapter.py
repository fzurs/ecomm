from allauth.account.adapter import DefaultAccountAdapter


class AccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        # Staff accounts are created on the server (create_operator). Customer signup comes with
        # the store's accounts (docs/architecture/auth.md, phase 3).
        return False
