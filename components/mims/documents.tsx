export function InvoicePreview() {
  return (
    <div className="doc-preview">
      <div className="doc-head">
        <div>
          <h2>INVOICE</h2>
          <div className="label-sm" style={{ marginTop: 4 }}>
            #MIMS-2026-0142
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>QC Films</div>
          <div style={{ color: "#6F6F6F", fontSize: 12 }}>quinton@qcfilms.co</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div>
          <div className="label-sm">Billed to</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>Summit Coffee Co.</div>
          <div style={{ color: "#6F6F6F" }}>Accounts Payable</div>
          <div style={{ color: "#6F6F6F" }}>ap@summitcoffee.com</div>
        </div>
        <div>
          <div className="label-sm">Issued</div>
          <div style={{ marginTop: 2 }}>May 14, 2026</div>
          <div className="label-sm" style={{ marginTop: 8 }}>
            Due
          </div>
          <div>Net 14 · May 28, 2026</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: "right" }}>Qty</th>
            <th style={{ textAlign: "right" }}>Rate</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pre-production & creative direction</td>
            <td style={{ textAlign: "right" }}>1</td>
            <td style={{ textAlign: "right" }}>$800</td>
            <td style={{ textAlign: "right" }}>$800</td>
          </tr>
          <tr>
            <td>Shoot day — full crew</td>
            <td style={{ textAlign: "right" }}>2</td>
            <td style={{ textAlign: "right" }}>$1,800</td>
            <td style={{ textAlign: "right" }}>$3,600</td>
          </tr>
          <tr>
            <td>Edit day — picture lock</td>
            <td style={{ textAlign: "right" }}>3</td>
            <td style={{ textAlign: "right" }}>$900</td>
            <td style={{ textAlign: "right" }}>$2,700</td>
          </tr>
          <tr>
            <td>Color + sound</td>
            <td style={{ textAlign: "right" }}>1</td>
            <td style={{ textAlign: "right" }}>$650</td>
            <td style={{ textAlign: "right" }}>$650</td>
          </tr>
          <tr>
            <td>Organic usage license · 12 mo</td>
            <td style={{ textAlign: "right" }}>1</td>
            <td style={{ textAlign: "right" }}>$650</td>
            <td style={{ textAlign: "right" }}>$650</td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          paddingTop: 8,
        }}
      >
        <span style={{ color: "#6F6F6F" }}>Subtotal</span>
        <span>$8,400</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginTop: 6,
        }}
      >
        <span style={{ color: "#6F6F6F" }}>50% deposit (due now)</span>
        <span>$4,200</span>
      </div>

      <div className="total">
        <span>Total due</span>
        <span>$8,400</span>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#888",
          lineHeight: 1.5,
        }}
      >
        Payment via ACH or wire. Late fees of 1.5%/mo accrue after 30 days.
        Project license activates on final payment.
      </div>
    </div>
  );
}

export function SowPreview() {
  return (
    <div className="doc-preview">
      <div className="doc-head">
        <div>
          <h2>SCOPE OF WORK</h2>
          <div className="label-sm" style={{ marginTop: 4 }}>
            QC Films × Summit Coffee Co.
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#6F6F6F" }}>
          v1.0 · May 14, 2026
        </div>
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 4 }}>Project</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 14px" }}>
        &quot;Single Origin&quot; — a 90-second brand video plus six 15-second
        cutdowns to drive 200 new monthly subscribers.
      </p>

      <h3 style={{ fontSize: 14, marginBottom: 6 }}>Deliverables</h3>
      <table>
        <tbody>
          <tr>
            <td>1× hero film</td>
            <td style={{ textAlign: "right" }}>90 sec</td>
          </tr>
          <tr>
            <td>6× social cutdowns</td>
            <td style={{ textAlign: "right" }}>15 sec each</td>
          </tr>
          <tr>
            <td>Raw select reel</td>
            <td style={{ textAlign: "right" }}>included</td>
          </tr>
          <tr>
            <td>Master files + ProRes</td>
            <td style={{ textAlign: "right" }}>delivered via Frame</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Timeline</h3>
      <table>
        <tbody>
          <tr>
            <td>Pre-pro / shotlist</td>
            <td style={{ textAlign: "right" }}>May 20</td>
          </tr>
          <tr>
            <td>Production (2 days)</td>
            <td style={{ textAlign: "right" }}>May 27–28</td>
          </tr>
          <tr>
            <td>Rough cut</td>
            <td style={{ textAlign: "right" }}>Jun 4</td>
          </tr>
          <tr>
            <td>Picture lock</td>
            <td style={{ textAlign: "right" }}>Jun 11</td>
          </tr>
          <tr>
            <td>Final delivery</td>
            <td style={{ textAlign: "right" }}>Jun 18</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Revisions</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px" }}>
        Two rounds included on the hero, one round each on the cutdowns.
        Additional rounds: $250 each. Major creative pivots after picture lock
        are re-quoted.
      </p>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Usage rights</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px" }}>
        Organic social and owned channels, 12 months. Paid media or broadcast
        usage: +$2,400 license extension.
      </p>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Investment</h3>
      <div className="total" style={{ borderColor: "#1A1A1F" }}>
        <span>Total</span>
        <span>$8,400</span>
      </div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
        50% on signing · 50% on final delivery
      </div>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Cancellation</h3>
      <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
        Kill fee of 50% if cancelled after pre-production begins. Deposit is
        non-refundable. Force majeure clause applies.
      </p>
    </div>
  );
}
