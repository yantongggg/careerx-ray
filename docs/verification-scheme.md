# Evidence verification — how we decide what we can stand behind

**Status: designed, not implemented.** The prototype records the trust
level on every piece of evidence and shows it to the user. The checks
described below are what raises an item from one level to the next in
production. We deliberately do not fake them today — an item nobody has
checked is labelled as such.

---

## The problem

A certificate is a PDF. Anyone can produce a PDF. If CareerX-Ray
displays an uploaded certificate the same way it displays a credential
we have actually confirmed with the issuer, then the product is telling
employers something it does not know — and the whole evidence layer is
worth nothing to them.

The answer is not to reject unverifiable evidence. Most of the people
this product exists for have exactly that kind of evidence. The answer
is to be explicit about which is which.

## Three trust levels

| Level | What it means | How an item gets here |
|---|---|---|
| **Verified** | Confirmed against the issuer's own record | The credential ID resolves on the issuer's verification endpoint and the name matches |
| **Corroborated** | Independently supported, but not issuer-confirmed | Comes from a source that is costly to fake — an employer letter on letterhead, a payslip, a match against a connected account |
| **Self-declared** | Provided by the user, unchecked | Anything uploaded on its own |

Every evidence item carries one of these (`TrustLevel` in
`src/app/lib/profileTypes.ts`), it is rendered next to the item, and an
employer-facing view would filter and sort on it.

## How Verified is earned

We ask for the **credential ID or verification URL**, not just the file.
The major issuers all publish one:

| Issuer | Verification surface |
|---|---|
| AWS | Certification verification portal, credential ID |
| Google Cloud / Google Ads | Public credential URL |
| Microsoft / Azure | Credential verification link |
| Coursera, Udacity, HubSpot, Meta Blueprint | Public certificate URL |
| Malaysian professional bodies (BOVAEA/REN, MIA, BEM) | Public register lookup by registration number |

A background job resolves the URL, confirms the holder name matches the
profile, records the check timestamp, and re-checks periodically so an
expired or revoked credential does not stay green.

**Two rules that matter:**

1. A failed check never silently downgrades to Verified-looking. It
   drops to Self-declared with a visible reason.
2. Name matching is fuzzy but not absent. A mismatch flags for review
   rather than auto-passing or auto-failing.

## How Corroborated is earned

Not everything has an issuer API — and the people most likely to be
excluded by that are exactly the ones this product is for. A restaurant
supervisor's proof of five years' work is a letter, not an API.

Corroborated covers:

- **Employer letters and payslips** — checked for letterhead, an
  identifiable organisation, and dates consistent with the rest of the
  profile. Cheap to check, expensive to forge convincingly.
- **Cross-source agreement** — a role claimed on the resume that also
  appears on a connected LinkedIn profile.
- **Referee contact** — an employer contact who confirms on request.

## What we would never do

- Show a trust badge we have not earned.
- Infer a credential from a resume mention. If the text says "AWS
  certified" and no credential was provided, that is Self-declared at
  most, and the AI extraction prompt in `api/analyze-resume.ts` says so
  explicitly.
- Let an employer see an evidence item without its trust level.

---

# Connecting LinkedIn

**Status: designed, not implemented.**

## Why not real OAuth

Real LinkedIn sign-in needs a LinkedIn-approved application, and their
approval cycle alone is longer than this hackathon. More importantly,
LinkedIn's current API does not return the data this product would want
— full position history, skills, endorsements — to a general
third-party app. Building an OAuth flow that returns a name and a photo
would look impressive and deliver nothing.

We would rather not ship a button that implies a connection we do not
have.

## The two paths that actually work

**1 · Paste your profile URL.**
The user pastes `linkedin.com/in/their-name`. We validate the format,
store it as an evidence source, and put it on their published portfolio
and applications. Trust level: Self-declared — we can show it, we have
not read it. This is what the prototype does today.

**2 · Import your LinkedIn data export.**
LinkedIn lets any user download their own data archive (Settings → Data
privacy → Get a copy of your data). It contains positions, education,
skills and certifications as CSV. We guide the user through requesting
it and let them upload the archive.

This is better than OAuth would have been:

- It returns **more** data than the API would.
- It needs no approval from LinkedIn and no ongoing API dependency.
- The user sees exactly what they are handing over, which is the right
  default for a product that is asking for someone's career history.

Positions imported this way are Corroborated when they agree with the
resume, Self-declared otherwise.

## What this costs

The export path takes the user a few minutes and a wait for LinkedIn to
prepare the file. That is a real friction cost, and we would measure
whether people complete it. But it is an honest friction, and the
alternative — a fake connect button — is not a cheaper version of the
same thing, it is a different thing that does not work.
