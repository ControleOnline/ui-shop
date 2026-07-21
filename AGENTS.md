## Shop Module

- Shop institutional images must come from company media fields exposed by the backend.
- `logo`, `icon`, `stamp`, and `pin` are different media roles and must not be read from shop config URL keys.
- Franchise map marker icons use the company or address `pin` media, falling back to the default map marker when no pin exists.
