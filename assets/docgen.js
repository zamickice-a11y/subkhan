// =====================================================================
// SOUTHERN DRIVE MOTORS — Document generator
//   renderDocHTML(form, data) -> HTML string (preview + print to PDF)
//   generateDocx(form, data)  -> downloads .docx
// =====================================================================
(function () {
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const money = (n) => {
    const v = Number(n || 0);
    return v.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  function computeTotals(items) {
    let sub = 0, gst = 0;
    (items || []).forEach(it => {
      const line = Number(it.qty || 0) * Number(it.unit || 0);
      sub += line;
      gst += Number(it.gst || 0);
    });
    return { sub, gst, total: sub + gst };
  }

  const BIZ = () => (window.SD_CONFIG && window.SD_CONFIG.BUSINESS) || {};

  // ---------- shared header (logo + title) ----------
  function docHead(title) {
    const b = BIZ();
    return `
      <div class="head">
        <div class="logo"><img src="assets/logo.png" alt="Southern Drive Motors"/></div>
        <div class="ttl">
          <div class="big">${esc(title)}</div>
          <div class="biz">${esc(b.name)}
            <small>ABN: ${esc(b.abn)} | Phone: ${esc(b.phone)}</small>
            <small>Email: ${esc(b.email)} | Address: ${esc(b.address)}</small>
          </div>
        </div>
      </div>`;
  }

  // ---------- footer (Capricorn + ARC + AU number, bottom-right) ----------
  function docFooter() {
    const b = BIZ();
    return `
      <div class="footer-certs">
        <div class="cert"><img src="assets/capricorn.png" alt="Stronger with Capricorn"/></div>
        <div class="cert">
          <img src="assets/arctick.png" alt="ARC Tick Certified"/>
          <div class="arcno">${esc(b.arc_no || "")}</div>
        </div>
      </div>`;
  }

  // ---------- bank details box ----------
  function bankBox() {
    const b = BIZ(), bk = b.bank || {};
    return `
      <div class="bank">
        <div class="ttl">Payment — Direct Deposit</div>
        <div class="row">
          <span><b>Account:</b> ${esc(bk.name)}</span>
          <span><b>BSB:</b> ${esc(bk.bsb)}</span>
          <span><b>Acc:</b> ${esc(bk.acc)}</span>
        </div>
        <div class="row" style="margin-top:3px"><span><b>Terms:</b> Net ${esc(bk.terms_days || 7)} days from invoice date</span></div>
      </div>`;
  }

  // ---------- header info table ----------
  function headerTable(d, isQuote) {
    const validity = Number(d.validity_days || 30);
    let validUntil = "";
    if (isQuote && d.date) {
      const dt = new Date(d.date); dt.setDate(dt.getDate() + validity);
      validUntil = dt.toLocaleDateString("en-AU");
    }
    const rows = isQuote ? [
      ["Quote No:", d.job_no, "Date:", d.date],
      ["Valid for:", `${validity} days`, "Valid until:", validUntil],
      ["Customer Name:", d.customer_name, "Phone:", d.phone],
      ["Customer Address:", d.address, "Email:", d.email],
      ["Vehicle:", d.vehicle, "Rego:", d.rego],
      ["Odometer (km):", d.odometer, "VIN:", d.vin],
    ] : [
      ["Invoice No:", d.job_no, "Date:", d.date],
      ["Due Date:", d.due_date, "Payment Terms:", d.payment_terms || "Net 7 days"],
      ["Customer Name:", d.customer_name, "Phone:", d.phone],
      ["Customer Address:", d.address, "Email:", d.email],
      ["Vehicle:", d.vehicle, "Rego:", d.rego],
      ["Odometer (km):", d.odometer, "VIN:", d.vin],
    ];
    return `<table>${rows.map(r => `
      <tr>
        <td class="lbl">${esc(r[0])}</td><td>${esc(r[1])}</td>
        <td class="lbl">${esc(r[2])}</td><td>${esc(r[3])}</td>
      </tr>`).join("")}</table>`;
  }

  // ---------- line items + totals ----------
  function itemsAndTotals(d) {
    const items = d.items || [];
    const t = computeTotals(items);
    const blankRows = Math.max(0, 6 - items.length);
    const rowsHtml = items.map(it => {
      const line = Number(it.qty || 0) * Number(it.unit || 0);
      return `<tr>
        <td class="c">${esc(it.qty)}</td>
        <td>${esc(it.desc)}</td>
        <td class="r">$${money(it.unit)}</td>
        <td class="r">$${money(it.gst)}</td>
        <td class="r">$${money(line)}</td></tr>`;
    }).join("") + Array(blankRows).fill(`<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>`).join("");
    return `
      <table class="items">
        <tr><th>Qty</th><th>Description (Parts &amp; Labour)</th><th>Unit Price</th><th>GST</th><th>Line Total</th></tr>
        ${rowsHtml}
      </table>
      <table class="tots">
        <tr><td class="lbl r">Subtotal (ex GST):</td><td class="r">$ ${money(t.sub)}</td></tr>
        <tr><td class="lbl r">GST:</td><td class="r">$ ${money(t.gst)}</td></tr>
        <tr class="grand"><td class="lbl r">Total (inc GST):</td><td class="r">$ ${money(t.total)}</td></tr>
      </table>`;
  }

  const nl2br = (s) => esc(s).replace(/\n/g, "<br/>");

  // =====================================================================
  // HTML — INVOICE
  // =====================================================================
  function invoiceHTML(d) {
    return `<div class="doc">
      <div class="page">
        ${docHead("TAX INVOICE")}
        ${headerTable(d, false)}
        ${itemsAndTotals(d)}
        ${bankBox()}
        ${d.notes ? `<p class="note" style="margin-top:14px"><b>Notes:</b></p><p class="note">${nl2br(d.notes)}</p>` : ""}
        <p class="note" style="margin-top:10px"><b>GST:</b> All prices include 10% GST. This invoice includes GST.</p>
        ${docFooter()}
      </div>
    </div>`;
  }

  // =====================================================================
  // HTML — QUOTE
  // =====================================================================
  function quoteHTML(d) {
    return `<div class="doc">
      <div class="page">
        ${docHead("QUOTE")}
        ${headerTable(d, true)}
        ${itemsAndTotals(d)}
        <p class="note" style="margin-top:14px"><b>Conditions:</b></p>
        <p class="note">${nl2br(d.notes)}</p>
        <p class="note" style="margin-top:10px"><b>GST:</b> All prices include 10% GST. This invoice includes GST.</p>
        <p class="note"><b>This is a quote, not a tax invoice.</b> A tax invoice will be issued on completion of approved work.</p>
        ${docFooter()}
      </div>
    </div>`;
  }

  function renderDocHTML(form, data) {
    return form.type === "quote" ? quoteHTML(data) : invoiceHTML(data);
  }

  // =====================================================================
  // DOCX generation — single page, no job sheet
  // (Capricorn/ARC shown as text in DOCX. PDF version has the logos.)
  // =====================================================================
  function generateDocx(form, data) {
    const D = window.docx;
    if (!D) { alert("Word library not loaded yet, try again in a moment."); return; }
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
            WidthType, BorderStyle, AlignmentType, ShadingType } = D;

    const b = BIZ();
    const isQuote = form.type === "quote";
    const border = { style: BorderStyle.SINGLE, size: 1, color: "B9B9B9" };
    const borders = { top: border, bottom: border, left: border, right: border };
    const CW = 9026;

    const tcell = (text, opts = {}) => new TableCell({
      borders,
      width: { size: opts.w || CW / 2, type: WidthType.DXA },
      shading: opts.lbl ? { fill: "EEF3F9", type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 40, bottom: 40, left: 90, right: 90 },
      children: (Array.isArray(text) ? text : [text]).map(t =>
        typeof t === "string"
          ? new Paragraph({ children: [new TextRun({ text: t, bold: !!opts.bold, size: 19 })] })
          : t),
    });
    const labelRow = (l, v, l2, v2) => new TableRow({ children: [
      tcell(l, { lbl: true, bold: true, w: CW * 0.23 }),
      tcell(v || "", { w: CW * 0.27 }),
      tcell(l2, { lbl: true, bold: true, w: CW * 0.23 }),
      tcell(v2 || "", { w: CW * 0.27 }),
    ]});

    const validity = Number(data.validity_days || 30);
    let validUntil = "";
    if (isQuote && data.date) { const dt = new Date(data.date); dt.setDate(dt.getDate() + validity); validUntil = dt.toLocaleDateString("en-AU"); }

    const headerInfoTable = () => new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [CW*0.23, CW*0.27, CW*0.23, CW*0.27],
      rows: isQuote ? [
        labelRow("Quote No:", data.job_no, "Date:", data.date),
        labelRow("Valid for:", `${validity} days`, "Valid until:", validUntil),
        labelRow("Customer Name:", data.customer_name, "Phone:", data.phone),
        labelRow("Customer Address:", data.address, "Email:", data.email),
        labelRow("Vehicle:", data.vehicle, "Rego:", data.rego),
        labelRow("Odometer (km):", data.odometer, "VIN:", data.vin),
      ] : [
        labelRow("Invoice No:", data.job_no, "Date:", data.date),
        labelRow("Due Date:", data.due_date, "Payment Terms:", data.payment_terms || "Net 7 days"),
        labelRow("Customer Name:", data.customer_name, "Phone:", data.phone),
        labelRow("Customer Address:", data.address, "Email:", data.email),
        labelRow("Vehicle:", data.vehicle, "Rego:", data.rego),
        labelRow("Odometer (km):", data.odometer, "VIN:", data.vin),
      ],
    });

    const t = computeTotals(data.items);
    const itemsTable = () => {
      const head = new TableRow({ children: ["Qty","Description (Parts & Labour)","Unit Price","GST","Line Total"].map(h =>
        tcell(h, { bold: true, w: CW/5 })) });
      const rows = (data.items || []).map(it => new TableRow({ children: [
        tcell(String(it.qty || ""), { w: CW*0.1 }),
        tcell(it.desc || "", { w: CW*0.5 }),
        tcell("$" + money(it.unit), { w: CW*0.13 }),
        tcell("$" + money(it.gst), { w: CW*0.12 }),
        tcell("$" + money(Number(it.qty||0)*Number(it.unit||0)), { w: CW*0.15 }),
      ]}));
      return new Table({ width:{size:CW,type:WidthType.DXA},
        columnWidths:[CW*0.1, CW*0.5, CW*0.13, CW*0.12, CW*0.15], rows: [head, ...rows] });
    };
    const totalsTable = () => new Table({ width:{size:CW*0.5,type:WidthType.DXA}, columnWidths:[CW*0.3,CW*0.2], rows:[
      new TableRow({children:[ tcell("Subtotal (ex GST):",{lbl:true,bold:true,w:CW*0.3}), tcell("$ "+money(t.sub),{w:CW*0.2}) ]}),
      new TableRow({children:[ tcell("GST:",{lbl:true,bold:true,w:CW*0.3}), tcell("$ "+money(t.gst),{w:CW*0.2}) ]}),
      new TableRow({children:[ tcell("Total (inc GST):",{lbl:true,bold:true,w:CW*0.3}), tcell("$ "+money(t.total),{w:CW*0.2}) ]}),
    ]});

    const p = (txt, opts={}) => new Paragraph({ children:[new TextRun({ text: txt, size: 18, bold: !!opts.bold })] });

    const titlePara = (txt) => new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: txt, bold: true, size: 44 })],
    });
    const bizPara = () => [
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: b.name, bold: true, size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `ABN: ${b.abn} | Phone: ${b.phone}`, size: 17 })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Email: ${b.email} | Address: ${b.address}`, size: 17 })] }),
      new Paragraph({ text: "" }),
    ];

    const children = [];
    children.push(titlePara(isQuote ? "QUOTE" : "TAX INVOICE"));
    children.push(...bizPara());
    children.push(headerInfoTable());
    children.push(new Paragraph({ text: "" }));
    children.push(itemsTable());
    children.push(new Paragraph({ text: "" }));
    children.push(totalsTable());
    children.push(new Paragraph({ text: "" }));

    if (!isQuote) {
      // Bank details for invoices
      const bk = b.bank || {};
      children.push(p("Payment — Direct Deposit:", { bold: true }));
      children.push(p(`Account: ${bk.name}    BSB: ${bk.bsb}    Acc: ${bk.acc}`));
      children.push(p(`Terms: Net ${bk.terms_days || 7} days from invoice date`));
      children.push(new Paragraph({ text: "" }));
    }

    if (data.notes) {
      children.push(p(isQuote ? "Conditions:" : "Notes:", { bold: true }));
      (data.notes || "").split("\n").forEach(line => children.push(p(line)));
      children.push(new Paragraph({ text: "" }));
    }

    children.push(p("GST: All prices include 10% GST. This invoice includes GST.", { bold: true }));
    if (isQuote) children.push(p("This is a quote, not a tax invoice. A tax invoice will be issued on completion of approved work.", { bold: true }));
    children.push(new Paragraph({ text: "" }));
    children.push(new Paragraph({ text: "" }));
    // Certifications as text (DOCX-friendly)
    children.push(new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "Stronger with Capricorn  •  ARC Tick Certified " + (b.arc_no || ""), size: 18, bold: true })] }));

    const doc = new Document({
      styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 800, right: 700, bottom: 800, left: 700 } } },
        children,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      const suffix = isQuote ? "QUOTE" : "INVOICE";
      const name = `${(data.job_no || form.type)}_${suffix}.docx`;
      window.saveAs(blob, name);
    });
  }

  window.SD_DOCGEN = { renderDocHTML, generateDocx, computeTotals, money };
})();
