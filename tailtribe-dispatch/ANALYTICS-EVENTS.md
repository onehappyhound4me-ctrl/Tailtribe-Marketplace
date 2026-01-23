# Analytics events (GA4 / GTM) – TailTribe Dispatch

Doel: consistente funnelmeting van **aanvraag → voorstel → keuze → bevestiging → uitvoering**.

## Event naming (current + recommended)

### Lead / booking
- **booking_request_submitted** (bestaat al)
  - **when**: aanvraag verstuurd
  - **params**:
    - `service` (string)
    - `time_window` (string)
    - `count` (number, optioneel bij bulk)
    - `direct` (boolean, optioneel bij direct-toewijzing)

### Owner actions
- **caregiver_selected** (bestaat al)
  - **params**: `booking_id`, `caregiver_id`
- **booking_confirmed** (bestaat al)
  - **params**: `booking_id`

## Recommended additions (next)
- **begin_booking**
  - when: user starts the booking flow (step 1 visible)
- **offer_sent**
  - when: admin creates an offer for an owner
  - params: `booking_id`, `caregiver_id`
- **booking_cancelled**
  - when: admin deletes/cancels a booking
  - params: `booking_id`
- **chat_opened**
  - when: chat view opened
  - params: `booking_id`

## Consent rule
- Alleen tracken (GA4/GTM) wanneer `tailtribe_cookie_consent === 'accepted'`.

