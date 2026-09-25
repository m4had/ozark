# Site audits

Plain-English website checks: accessibility (axe-core, WCAG 2.2 A/AA), cookies before consent, email authentication (SPF/DKIM/DMARC), and shop legal information.

```
npm install
node audit.mjs https://example.com --client "Name"     # accessibility PDF
node cookie-check.mjs https://example.com               # cookies set before consent
node email-check.mjs example.com                        # SPF, DKIM, DMARC
node legal-check.mjs https://example.com                # trader info, returns, terms, privacy
npm test
```

## GitHub Action (free)

```yaml
- uses: m4had/ozark/products/a11y-audit@main
  with:
    url: https://your-preview-url.example
    pages: 10
    fail-on: serious   # critical | serious | moderate | none
```
The PDF report is attached to the run as an artifact. Automated tools find only part of accessibility barriers; this is not a conformance certificate.
