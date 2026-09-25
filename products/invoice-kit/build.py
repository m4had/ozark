#!/usr/bin/env python3
"""Build the UK tradesperson quote + invoice kit (idea #7, delivered as a spreadsheet, not Canva).

Output: dist/Quote_and_Invoice_Kit_UK.xlsx
Invoice fields follow gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include
and, for VAT-registered traders, gov.uk/guidance/vat-guide-notice-700 (VAT invoices). Checked 2026-09-25.
"""
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

OUT = Path(__file__).resolve().parents[2] / "dist" / "Quote_and_Invoice_Kit_UK.xlsx"
INPUT = PatternFill("solid", fgColor="FFF2CC")
HEAD, HEAD_FILL = Font(bold=True, color="FFFFFF"), PatternFill("solid", fgColor="7F3F00")
THIN = Border(bottom=Side(style="thin", color="999999"))
GBP = '£#,##0.00'
LINES = 12


def business_sheet(wb):
    ws = wb.active
    ws.title = "My business"
    ws.column_dimensions["A"].width = 34
    ws.column_dimensions["B"].width = 44
    ws["A1"], ws["A1"].font = "Your details (fill in once – used on every quote and invoice)", Font(bold=True, size=14)
    fields = ["Business / trading name", "Your name (sole traders must show it)", "Address line 1", "Address line 2",
              "Town / postcode", "Phone", "Email", "Company number (if limited)", "VAT registered? (Yes/No)",
              "VAT number", "Bank name", "Sort code", "Account number", "Payment terms (days)", "Next invoice number"]
    for i, f in enumerate(fields, 3):
        ws[f"A{i}"] = f
        ws[f"B{i}"].fill = INPUT
    ws["B11"] = "No"
    ws["B16"] = 30
    ws["B17"] = 1001
    dv = DataValidation(type="list", formula1='"Yes,No"')
    ws.add_data_validation(dv)
    dv.add("B11")


def doc_sheet(wb, title, kind):
    ws = wb.create_sheet(title)
    for col, w in zip("ABCDEF", (44, 10, 14, 10, 14, 4)):
        ws.column_dimensions[col].width = w
    b = "'My business'!"
    ws["A1"] = f"={b}B3"
    ws["A1"].font = Font(bold=True, size=18)
    ws["A2"] = f'={b}B4&" · "&{b}B5&", "&{b}B6&", "&{b}B7'
    ws["A3"] = f'={b}B8&" · "&{b}B9&IF({b}B10<>"","  ·  Company no. "&{b}B10,"")'
    ws["D1"] = kind.upper()
    ws["D1"].font = Font(bold=True, size=18)
    labels = ([("Invoice no.", f"={b}B17"), ("Invoice date", None), ("Tax point / supply date", None),
               ("Due date", "=IF(E6=\"\",\"\",E6+'My business'!B16)")] if kind == "Invoice"
              else [("Quote no.", None), ("Quote date", None), ("Valid until", "=IF(E6=\"\",\"\",E6+30)")])
    for i, (label, val) in enumerate(labels, 5):
        ws[f"D{i}"] = label
        ws[f"E{i}"] = val
        if val is None or kind == "Invoice" and i == 5:
            ws[f"E{i}"].fill = INPUT
        if i > 5:
            ws[f"E{i}"].number_format = "dd/mm/yyyy"
    ws["A5"], ws["A5"].font = "To:", Font(bold=True)
    for r in range(6, 10):
        ws[f"A{r}"].fill = INPUT
    head = 11
    for i, h in enumerate(["Description", "Qty", "Unit price £", "VAT %", "Line total £"], 1):
        c = ws.cell(row=head, column=i, value=h)
        c.font, c.fill = HEAD, HEAD_FILL
    vat_dv = DataValidation(type="list", formula1='"0.2,0.05,0"', allow_blank=True)
    ws.add_data_validation(vat_dv)
    for r in range(head + 1, head + 1 + LINES):
        for col in "ABCD":
            ws[f"{col}{r}"].fill = INPUT
            ws[f"{col}{r}"].border = THIN
        vat_dv.add(f"D{r}")
        ws[f"C{r}"].number_format = GBP
        ws[f"E{r}"] = f'=IF(B{r}="","",B{r}*C{r})'
        ws[f"E{r}"].number_format = GBP
        ws[f"D{r}"].number_format = "0%"
        ws[f"F{r}"] = f'=IF(E{r}="",0,E{r}*N(D{r}))'  # hidden helper: VAT per line
    ws.column_dimensions["F"].hidden = True
    first, last = head + 1, head + LINES
    t = last + 2
    ws[f"D{t}"], ws[f"E{t}"] = "Subtotal", f"=SUM(E{first}:E{last})"
    ws[f"D{t + 1}"] = "VAT"
    ws[f"E{t + 1}"] = f'=IF({b}B11="Yes",SUM(F{first}:F{last}),0)'
    ws[f"D{t + 2}"], ws[f"E{t + 2}"] = "TOTAL", f"=E{t}+E{t + 1}"
    for r in range(t, t + 3):
        ws[f"E{r}"].number_format = GBP
    ws[f"D{t + 2}"].font = ws[f"E{t + 2}"].font = Font(bold=True, size=13)
    n = t + 4
    if kind == "Invoice":
        ws[f"A{n}"] = f'="Please pay to "&{b}B13&" · Sort code "&{b}B14&" · Account "&{b}B15&" · Reference: "&E5'
        ws[f"A{n + 1}"] = f'=IF({b}B11="Yes","VAT number: "&{b}B12,"Not VAT registered – no VAT charged.")'
    else:
        ws[f"A{n}"] = "This quote is a fixed price for the work described. Anything extra will be quoted before it is done."
        ws[f"A{n + 1}"] = f'=IF({b}B11="Yes","Prices include VAT where shown. VAT number: "&{b}B12,"Not VAT registered – no VAT charged.")'
    ws[f"A{n}"].alignment = Alignment(wrap_text=True)
    ws.print_area = f"A1:E{n + 1}"
    ws.page_setup.fitToWidth = 1


def log_sheet(wb):
    ws = wb.create_sheet("Invoice log")
    heads = ["Invoice no.", "Date", "Customer", "Total £", "Paid on", "Days to pay", "Status"]
    for i, h in enumerate(heads, 1):
        c = ws.cell(row=1, column=i, value=h)
        c.font, c.fill = HEAD, HEAD_FILL
        ws.column_dimensions[chr(64 + i)].width = 16
    ws.column_dimensions["C"].width = 30
    for r in range(2, 502):
        for col in "ABCDE":
            ws[f"{col}{r}"].fill = INPUT
        ws[f"B{r}"].number_format = ws[f"E{r}"].number_format = "dd/mm/yyyy"
        ws[f"D{r}"].number_format = GBP
        ws[f"F{r}"] = f'=IF(OR(B{r}="",E{r}=""),"",E{r}-B{r})'
        ws[f"G{r}"] = (f"=IF(B{r}=\"\",\"\",IF(E{r}<>\"\",\"Paid\",IF(TODAY()-B{r}>'My business'!$B$16,"
                       f"\"OVERDUE\",\"Awaiting\")))")
    ws.freeze_panes = "A2"


def help_sheet(wb):
    ws = wb.create_sheet("How to use")
    ws.column_dimensions["A"].width = 100
    for i, t in enumerate([
        "1. Fill in 'My business' once. 2. Copy the Quote or Invoice sheet for each job (right-click tab → Duplicate).",
        "3. Fill the yellow cells, then File → Print / Save as PDF and send it.",
        "4. After sending an invoice, add it to 'Invoice log' and raise 'Next invoice number' by 1 – numbers must be unique and in sequence.",
        "Sole traders must show their own name on invoices; limited companies must show the registered company name and number.",
        "Only show VAT if you are VAT registered. VAT invoices must show your VAT number, the tax point and VAT per rate.",
        "Late payment: you can claim statutory interest and compensation on overdue business-to-business invoices (gov.uk/late-commercial-payments-interest-debt-recovery).",
        "A template to help you invoice correctly – not legal or tax advice.",
    ], 1):
        ws[f"A{i}"] = t
        ws[f"A{i}"].alignment = Alignment(wrap_text=True)


def build(out=OUT):
    wb = Workbook()
    business_sheet(wb)
    doc_sheet(wb, "Quote", "Quote")
    doc_sheet(wb, "Invoice", "Invoice")
    log_sheet(wb)
    help_sheet(wb)
    out.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out)
    return out


if __name__ == "__main__":
    print(build())
