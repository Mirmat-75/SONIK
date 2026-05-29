# SONIK – Manual QA Test Plan

**Tester:** QA & Documentation Lead  
**Date:** ___________  
**Tested on:** Deployed URL — `https://sonik.vercel.app`  
**Browser(s):** Chrome ___  Firefox ___  Safari (mobile) ___

---

## Pre-conditions

- [ ] App is live at the deployed URL (no local setup)
- [ ] Demo account exists: `demo@sonik.app` / `sonik2026`
- [ ] At least one favourite saved to the demo account

---

## TC-01 · Browse Without Login

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | Open `/events` | Event grid loads with images, titles, dates | |
| 2 | Type "Taylor Swift" in the search bar, click Search | Grid updates with matching events | |
| 3 | Select "Rock" in genre dropdown, click Search | Events filtered to rock genre | |
| 4 | Click the heart icon on any event | Alert: "Sign in to save favorites!" | |
| 5 | Navigate to `/favorites` | Redirect or "Sign in" prompt shown | |

---

## TC-02 · Sign Up

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | Go to `/auth`, click "Create account" | Sign-up form visible | |
| 2 | Enter a new test email + password ≥6 chars, submit | Success message: "Check your email…" | |
| 3 | Confirm email via inbox link | User can sign in | |

---

## TC-03 · Sign In

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | Go to `/auth`, enter `demo@sonik.app` / `sonik2026`, Sign in | Redirect to `/events`, "Sign out" appears in nav | |
| 2 | Refresh page | Still signed in (session persisted) | |

---

## TC-04 · Add & Remove Favourite

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | On `/events`, click heart on an event | Heart turns red | |
| 2 | Navigate to `/favorites` | Event appears in favourites list | |
| 3 | Click red heart on that event | Event removed from list immediately | |
| 4 | Refresh `/favorites` | Event is gone (DB deletion persisted) | |

---

## TC-05 · Recommendations

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | Go to `/recommendations` (signed in) | Genre chips and city field visible | |
| 2 | Select "Rock" and "Electronic", enter "Toronto", click "Get my picks" | Loading state shown | |
| 3 | After response | Purple AI blurb + grid of up to 6 events shown | |
| 4 | Click "Get my picks" with no genres selected | Error: "Pick at least one genre." | |

---

## TC-06 · Error Handling

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | With DevTools, throttle network to "Offline", trigger a search | Error message displayed (not blank screen) | |
| 2 | Restore network, retry | Events load normally | |

---

## TC-07 · Responsive / Mobile

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | Open Chrome DevTools → 390px width (iPhone 14) | Navbar collapses correctly | |
| 2 | Browse `/events` at 390px | Cards stack to single column, no overflow | |
| 3 | Open `/auth` at 390px | Form is usable without horizontal scroll | |

---

## TC-08 · Security Checks

| Step | Action | Expected result | Pass/Fail |
|---|---|---|---|
| 1 | Inspect Network tab while browsing events | No API keys in any request or response headers | |
| 2 | Try `GET /favorites` with no Authorization header (curl) | 403 or 401 returned | |
| 3 | Check GitHub repo for `.env` file | Only `.env.example` committed | |

---

## Sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| QA Lead | | | |
| Project Manager | | | |
