import { useRef } from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';
import Button from './ui/Button';
import './BillReceiptModal.css';

export default function BillReceiptModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const base = booking.basePrice || 299;
  const weatherSurcharge = booking.weatherMultiplier > 1 ? Math.round(base * (booking.weatherMultiplier - 1)) : 0;
  const gst = booking.gst || Math.round(base * 0.18);
  const welfareCess = booking.welfareCess || Math.round(base * 0.02);
  const total = booking.totalPrice || (base + weatherSurcharge + gst + welfareCess);

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-container animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Action Header (Hidden in Print) */}
        <div className="receipt-modal-header hide-in-print">
          <div className="receipt-header-title">
            <FileText size={20} className="text-primary" />
            <h3>Service Bill & Tax Invoice</h3>
          </div>
          <div className="receipt-header-actions">
            <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
              Print Receipt
            </Button>
            <button className="receipt-close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="receipt-paper" id="printable-receipt">
          {/* Cooperative Header */}
          <div className="receipt-coop-brand">
            <div className="receipt-logo-badge">सहकार सेवा</div>
            <h2>SAHAKAR SEVA COOPERATIVE FEDERATION</h2>
            <p className="receipt-subtitle">A Government-Backed Multipurpose Workers Cooperative Society</p>
            <p className="receipt-reg text-xs text-muted">Reg. No: DL-COP-2024-8891 • GSTIN: 07AAACS1234F1Z5</p>
          </div>

          <div className="receipt-divider double" />

          {/* Tax Invoice Info Row */}
          <div className="receipt-meta-grid">
            <div>
              <span className="receipt-meta-label">Tax Invoice No:</span>
              <strong className="receipt-meta-value font-mono">INV-2026-{booking.id}</strong>
            </div>
            <div>
              <span className="receipt-meta-label">Booking Reference:</span>
              <strong className="receipt-meta-value font-mono">#{booking.id}</strong>
            </div>
            <div>
              <span className="receipt-meta-label">Date & Time:</span>
              <span className="receipt-meta-value">{booking.date} at {booking.time}</span>
            </div>
            <div>
              <span className="receipt-meta-label">Payment Status:</span>
              <span className="receipt-badge-paid">PAID VIA ONLINE (ESCROW)</span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Customer & Worker Info */}
          <div className="receipt-parties-grid">
            <div className="receipt-party-card">
              <span className="receipt-party-title">Billed To (Customer):</span>
              <h4 className="receipt-party-name">{booking.customerName || 'Customer'}</h4>
              <p className="text-xs text-muted">📍 {booking.address || '12, Sector 45, Gurugram, Haryana'}</p>
            </div>
            <div className="receipt-party-card">
              <span className="receipt-party-title">Assigned Professional:</span>
              <h4 className="receipt-party-name">{booking.workerName || 'Assigned Cooperative Expert'}</h4>
              <p className="text-xs text-muted">
                ⭐ {booking.workerRating ? `${booking.workerRating} Rating` : 'Cooperative Verified'} • Verified Pro
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item / Description</th>
                <th>SAC Code</th>
                <th>Rate</th>
                <th style={{ textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{booking.serviceName}</strong>
                  <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                    {booking.description || 'Standard inspection, repair & service'}
                  </p>
                </td>
                <td className="font-mono text-xs">998719</td>
                <td>₹{base}</td>
                <td style={{ textAlign: 'right' }}>₹{base}</td>
              </tr>
              {weatherSurcharge > 0 && (
                <tr className="receipt-extra-row">
                  <td>Weather Condition Adjustment ({booking.weatherCondition})</td>
                  <td className="font-mono text-xs">—</td>
                  <td>+₹{weatherSurcharge}</td>
                  <td style={{ textAlign: 'right' }}>₹{weatherSurcharge}</td>
                </tr>
              )}
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>CGST @ 9%:</td>
                <td style={{ textAlign: 'right' }}>₹{Math.round(gst / 2)}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>SGST @ 9%:</td>
                <td style={{ textAlign: 'right' }}>₹{Math.round(gst / 2)}</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Cooperative Welfare Fund (2%):</td>
                <td style={{ textAlign: 'right' }}>₹{welfareCess}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="receipt-total-row">
                <td colSpan="3">Total Amount Paid (Inclusive of Taxes):</td>
                <td style={{ textAlign: 'right' }}>₹{total}</td>
              </tr>
            </tfoot>
          </table>

          {/* Security OTP & Terms */}
          <div className="receipt-footer-box">
            <div className="receipt-otp-pill">
              <ShieldCheck size={18} className="text-success" />
              <span>Service Verification Start OTP: <strong>4892</strong></span>
            </div>
            <p className="receipt-terms text-xs text-muted">
              🛡️ All cooperative services come with a 7-day workmanship satisfaction warranty.
              For disputes or claims, contact Sahakar Seva Toll-Free Helpline: 1800-889-2024.
            </p>
          </div>

          <div className="receipt-seal-row">
            <div className="receipt-qr-sim">
              <div className="receipt-qr-code">QR CODE</div>
              <span className="text-xs text-muted">Scan to Verify Invoice</span>
            </div>
            <div className="receipt-stamp">
              <span>AUTHORIZED SIGNATORY</span>
              <strong>SAHAKAR SEVA FEDERATION</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
