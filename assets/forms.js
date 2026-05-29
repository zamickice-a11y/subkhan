// =====================================================================
// SOUTHERN DRIVE MOTORS — Form definitions (invoice + quote)
// =====================================================================
(function () {

  const headerFields = [
    { k:"job_no",         label:"Number",            type:"text", col:1 },
    { k:"date",           label:"Date",              type:"date", col:1 },
    { k:"due_date",       label:"Due Date",          type:"date", col:1 },
    { k:"payment_terms",  label:"Payment Terms",     type:"text", col:1 },
    { k:"customer_name",  label:"Customer Name",     type:"text", col:1 },
    { k:"phone",          label:"Phone",             type:"text", col:1 },
    { k:"address",        label:"Customer Address",  type:"text", col:2 },
    { k:"email",          label:"Email",             type:"text", col:1 },
    { k:"vehicle",        label:"Vehicle (make/model/year)", type:"text", col:1 },
    { k:"rego",           label:"Rego",              type:"text", col:1 },
    { k:"odometer",       label:"Odometer (km)",     type:"text", col:1 },
    { k:"vin",            label:"VIN",               type:"text", col:1 },
  ];

  // ---- INVOICE (single page) ----
  const invoice = {
    type: "invoice",
    title: "Invoice",
    invoiceTitle: "TAX INVOICE",
    header: headerFields,
    sections: [
      { legend:"Invoice line items", fields:[ { k:"items", type:"lineitems" } ] },
      { legend:"Notes (optional)",   fields:[
        { k:"notes", label:"Notes for customer (next service, recommendations, etc.)", type:"textarea", big:true },
      ]},
    ],
    defaults: {
      payment_terms: "Net 7 days",
    },
  };

  // ---- QUOTE ----
  const quote = {
    type: "quote",
    title: "Quote / Estimate",
    invoiceTitle: "QUOTE",
    header: headerFields,
    sections: [
      { legend:"Quote line items", fields:[ { k:"items", type:"lineitems" } ] },
      { legend:"Conditions", fields:[
        { k:"validity_days", label:"Valid for (days)", type:"text", col:1 },
        { k:"notes", label:"Quote notes / conditions", type:"textarea", big:true },
      ]},
    ],
    defaults: {
      validity_days: "30",
      notes: "This quote is valid for 30 days from the date of issue. Parts prices subject to supplier availability and may vary at time of purchase. No work will commence without your written or verbal approval.",
    },
  };

  // =====================================================================
  // QUICK-PICK PRESETS — generic mechanic items / common notes
  // (Khan can save his own snippets to extend these.)
  // =====================================================================
  const PRESETS = {
    lineItems: [
      { group: "Service", items: [
        { label: "Log book service", desc: "Log book service ___km", unit: 170 },
        { label: "Standard service", desc: "Standard service ___km", unit: 170 },
        { label: "Diagnostic & labor fee", desc: "Diagnostic & labor fee", unit: 170 },
        { label: "Labour (per hour)", desc: "Labour", unit: 110 },
      ]},
      { group: "Filters", items: [
        { label: "Engine oil filter", desc: "Engine oil filter", unit: 15 },
        { label: "Engine air filter", desc: "Engine air filter", unit: 48 },
        { label: "Cabin filter", desc: "Cabin filter", unit: 24 },
        { label: "Fuel filter", desc: "Fuel filter", unit: 35 },
      ]},
      { group: "Engine oil", items: [
        { label: "Castrol 5W30 full synthetic", desc: "Castrol 5W30 full synthetic", unit: 16.5 },
        { label: "Castrol Magnatec 5W30", desc: "Castrol Magnatec 5W30 full synthetic", unit: 14.5 },
        { label: "Penrite 5W30 C3", desc: "Penrite 5W30 full synthetic C3", unit: 14.5 },
      ]},
      { group: "Spark plugs", items: [
        { label: "Iridium spark plugs", desc: "Spark plugs (iridium)", unit: 47 },
        { label: "NGK platinum", desc: "NGK platinum spark plug", unit: 49.9 },
        { label: "Spark plugs", desc: "Spark plugs", unit: 42 },
      ]},
      { group: "Brakes", items: [
        { label: "Front brake pads (pair)", desc: "Front brake pads (ceramic) pair", unit: 150 },
        { label: "Rear brake pads (pair)", desc: "Rear brake pads (ceramic) pair", unit: 100 },
        { label: "Front brake rotors", desc: "Front brake rotors", unit: 220 },
        { label: "Rear brake rotors", desc: "Rear brake rotors", unit: 145 },
      ]},
      { group: "Engine parts", items: [
        { label: "Engine drive belt", desc: "Engine drive belt", unit: 97 },
        { label: "Ignition coils pack", desc: "Ignition coils pack", unit: 280 },
        { label: "Battery", desc: "Battery", unit: 220 },
      ]},
      { group: "Air-con", items: [
        { label: "Air-con regas R134a", desc: "Air-con regas R134a (per kg)", unit: 95 },
        { label: "Air-con regas R1234yf", desc: "Air-con regas R1234yf (per kg)", unit: 220 },
        { label: "Air-con leak test", desc: "Air-con leak test & inspection", unit: 110 },
      ]},
    ],

    work: {
      // Useful notes for invoice / quote notes field
      note_tyres: { label: "Tyre tread", text:
        "Checked tyres. Tread depth remaining: front left ___mm right ___mm, rear left ___mm right ___mm." },
      note_brakes: { label: "Brakes remaining", text:
        "Approx front brakes ___mm remaining, rear brakes ___mm (visual inspection only, most worn pad reported)." },
      note_pressure: { label: "Tyre pressure", text:
        "Tyre pressure: front left ___ PSI right ___ PSI, rear left ___ PSI right ___ PSI." },
      note_battery: { label: "Battery report", text:
        "Battery smart test - see attached report." },
      note_book: { label: "Service book", text:
        "Service book completed and placed in vehicle." },
      note_lastreplaced: { label: "Last replaced", text:
        "Last replaced:\nEngine oil filter ___/___/______ @___km" },
      note_nextservice: { label: "Next service due", text:
        "Next service due at ___,___km or in ___ months, whichever comes first." },
      note_thanks: { label: "Thank you", text:
        "Thank you for choosing Southern Drive Motors. Workmanship warranty 3 months / 5,000 km (whichever comes first). Customer-supplied parts not covered." },
    },
  };

  // Attach quick chips to notes fields
  const NOTE_KEYS = ["note_tyres","note_brakes","note_pressure","note_battery","note_book","note_lastreplaced","note_nextservice","note_thanks"];
  [invoice, quote].forEach(form => {
    form.sections.forEach(s => s.fields.forEach(f => {
      if (f.k === "notes") f.quick = NOTE_KEYS;
    }));
  });

  window.SD_FORMS = { invoice, quote, PRESETS };
})();
