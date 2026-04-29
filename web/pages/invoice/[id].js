import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function InvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuthStore();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    const isAdmin = isAuthenticated && user?.role === 'admin';
    const endpoint = isAdmin
      ? `/admin/orders/${id}/invoice`
      : `/checkout/order/${id}/invoice`;

    api.get(endpoint).then(res => {
      if (res.data?.order) setData(res.data);
      else setError('Invoice not found.');
    }).catch(() => setError('Could not load invoice.')).finally(() => setLoading(false));
  }, [id, isAuthenticated, user]);

  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Poppins,sans-serif', color:'#888' }}>
      Loading invoice…
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Poppins,sans-serif', gap:16 }}>
      <p style={{ color:'#c53030' }}>{error}</p>
      <a href="/track" style={{ color:'#2fa8bc', textDecoration:'none', fontWeight:600 }}>← Back to Track Order</a>
    </div>
  );

  const { order, items, payment, shipment, customer, shipping_address } = data;
  const subtotal     = Number(order.subtotal      || 0);
  const taxAmount    = Number(order.tax_amount    || 0);
  const shippingCost = Number(order.shipping_cost || 0);
  const discountAmt  = Number(order.discount_amount || 0);
  const total        = Number(order.total_amount  || 0);

  const STATUS_COLOR = {
    paid:'#166534', pending:'#9a3412', failed:'#991b1b',
    completed:'#166534', refunded:'#7e22ce'
  };

  return (
    <>
      <Head>
        <title>Invoice {order.order_number} — TechWholesale</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Poppins', sans-serif; background: #f4f5f7; color: #1a1a3f; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .invoice-shell { max-width: 820px; margin: 0 auto; padding: 32px 24px 60px; }

          /* ── toolbar (screen only) ── */
          .toolbar {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
          }
          .toolbar-back { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#2fa8bc; text-decoration:none; font-weight:600; }
          .toolbar-back:hover { color:#16163f; }
          .toolbar-right { display:flex; gap:10px; }
          .btn-print {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 22px; background: #16163f; color: #fff;
            border: 2px solid #16163f; border-radius: 4px;
            font-family: 'Montserrat',sans-serif; font-size: 12px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.1em;
            cursor: pointer; transition: all 0.2s; text-decoration: none;
          }
          .btn-print:hover { background: #56cfe1; border-color: #56cfe1; color: #16163f; }

          /* ── invoice paper ── */
          .invoice {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 32px rgba(0,0,0,0.10);
            overflow: hidden;
          }

          /* header band */
          .inv-header {
            background: linear-gradient(135deg, #16163f 0%, #1e1e5a 100%);
            padding: 36px 40px;
            display: flex; justify-content: space-between; align-items: flex-start;
          }
          .inv-logo {
            font-family: 'Montserrat',sans-serif;
            font-size: 26px; font-weight: 800;
            color: #fff; letter-spacing: -0.5px;
          }
          .inv-logo span { color: #56cfe1; }
          .inv-logo small {
            display: block; font-size: 11px; font-weight: 500;
            letter-spacing: 0.15em; text-transform: uppercase;
            color: rgba(255,255,255,0.45); margin-top: 3px;
          }
          .inv-title-block { text-align: right; }
          .inv-title {
            font-family: 'Montserrat',sans-serif;
            font-size: 28px; font-weight: 800;
            color: #fff; letter-spacing: -0.5px;
          }
          .inv-number {
            font-size: 13px; color: rgba(255,255,255,0.65);
            margin-top: 4px; font-weight: 500;
          }
          .inv-date {
            font-size: 12px; color: rgba(255,255,255,0.5);
            margin-top: 3px;
          }

          /* status ribbon */
          .inv-ribbon {
            padding: 10px 40px;
            background: #f0fdf4;
            border-bottom: 1px solid #dcfce7;
            display: flex; align-items: center; gap: 10px;
          }
          .inv-ribbon.pending { background: #fff7ed; border-bottom-color: #fed7aa; }
          .inv-ribbon.failed  { background: #fef2f2; border-bottom-color: #fecaca; }
          .ribbon-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
          .ribbon-text { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

          /* meta grid */
          .inv-meta {
            display: grid; grid-template-columns: repeat(3, 1fr);
            gap: 0; border-bottom: 1px solid #eee;
          }
          .meta-block { padding: 24px 32px; border-right: 1px solid #f0f0f0; }
          .meta-block:last-child { border-right: none; }
          .meta-label {
            font-size: 10px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.12em; color: #9aa0ab; margin-bottom: 8px;
          }
          .meta-name { font-family: 'Montserrat',sans-serif; font-size: 14px; font-weight: 700; color: #16163f; margin-bottom: 4px; }
          .meta-line { font-size: 12px; color: #6b7280; line-height: 1.7; }

          /* line items */
          .inv-items { padding: 0 32px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 24px 0 0; }
          .items-table thead tr { border-bottom: 2px solid #f0f0f0; }
          .items-table th {
            font-family: 'Montserrat',sans-serif;
            font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.1em;
            color: #9aa0ab; padding: 0 0 12px;
            text-align: left;
          }
          .items-table th.right { text-align: right; }
          .items-table tbody tr { border-bottom: 1px solid #f8f8f8; }
          .items-table tbody tr:last-child { border-bottom: none; }
          .items-table td { padding: 13px 0; font-size: 13px; color: #374151; vertical-align: top; }
          .items-table td.right { text-align: right; }
          .td-name { font-weight: 600; color: #16163f; }
          .td-sku { font-size: 11px; color: #9aa0ab; font-family: monospace; margin-top: 2px; }

          /* totals */
          .inv-totals { padding: 0 32px 28px; }
          .totals-wrap {
            margin-left: auto; max-width: 300px;
            border-top: 2px solid #f0f0f0; padding-top: 16px;
          }
          .totals-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 0; font-size: 13px; color: #6b7280;
          }
          .totals-row.discount { color: #22c55e; }
          .totals-row.grand {
            border-top: 2px solid #16163f;
            margin-top: 8px; padding-top: 12px;
            font-family: 'Montserrat',sans-serif;
            font-size: 18px; font-weight: 800; color: #16163f;
          }

          /* shipment */
          .inv-shipment {
            margin: 0 32px 28px;
            padding: 14px 18px;
            background: #f8f9ff;
            border: 1px solid #e8eaed;
            border-radius: 8px;
            display: flex; align-items: center; gap: 20px;
            font-size: 13px;
          }
          .ship-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9aa0ab; margin-bottom: 3px; }
          .ship-val { font-weight: 600; color: #16163f; font-family: monospace; }

          /* footer */
          .inv-footer {
            padding: 20px 40px;
            background: #fafafa;
            border-top: 1px solid #f0f0f0;
            display: flex; justify-content: space-between; align-items: center;
          }
          .footer-note { font-size: 11px; color: #9aa0ab; line-height: 1.6; }
          .footer-brand { font-family: 'Montserrat',sans-serif; font-size: 13px; font-weight: 700; color: #16163f; }
          .footer-brand span { color: #56cfe1; }

          /* ── PRINT STYLES ── */
          @media print {
            body { background: #fff !important; }
            .toolbar { display: none !important; }
            .invoice-shell { padding: 0; max-width: 100%; }
            .invoice { box-shadow: none; border-radius: 0; }
            .inv-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @media (max-width: 640px) {
            .inv-header { flex-direction: column; gap: 16px; }
            .inv-title-block { text-align: left; }
            .inv-meta { grid-template-columns: 1fr; }
            .meta-block { border-right: none; border-bottom: 1px solid #f0f0f0; padding: 18px 20px; }
            .inv-items, .inv-totals { padding: 0 20px 20px; }
            .inv-footer { flex-direction: column; gap: 12px; text-align: center; }
          }
        `}</style>
      </Head>

      <div className="invoice-shell">
        {/* Toolbar */}
        <div className="toolbar">
          <a
            href={isAuthenticated && user?.role === 'admin' ? '/admin/orders' : '/track'}
            className="toolbar-back"
          >
            ← {isAuthenticated && user?.role === 'admin' ? 'Back to Orders' : 'Back to Tracking'}
          </a>
          <div className="toolbar-right">
            <button className="btn-print" onClick={() => window.print()}>
              🖨 Download / Print PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="invoice">
          {/* Header */}
          <div className="inv-header">
            <div>
              <div className="inv-logo">Tech<span>Whole</span>sale<small>Your Trusted Tech Partner</small></div>
              <div style={{ marginTop:12, fontSize:11, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
                123 Tech Plaza, San Francisco, CA 94102<br />
                hello@techwholesale.com · +1 (800) 555-TECH
              </div>
            </div>
            <div className="inv-title-block">
              <div className="inv-title">INVOICE</div>
              <div className="inv-number"># {order.order_number}</div>
              <div className="inv-date">Issued: {fmtDate(order.created_at)}</div>
              {order.shipped_at && <div className="inv-date">Shipped: {fmtDate(order.shipped_at)}</div>}
            </div>
          </div>

          {/* Payment status ribbon */}
          <div className={`inv-ribbon ${payment?.status !== 'completed' ? 'pending' : ''}`}>
            <span
              className="ribbon-dot"
              style={{ color: STATUS_COLOR[payment?.status] || STATUS_COLOR.pending }}
            />
            <span
              className="ribbon-text"
              style={{ color: STATUS_COLOR[payment?.status] || STATUS_COLOR.pending }}
            >
              Payment {payment?.status === 'completed' ? 'Paid' : (payment?.status || 'Pending')}
              {payment?.transaction_id && ` · ${payment.transaction_id}`}
            </span>
          </div>

          {/* Meta: Bill To / Ship To / Order Info */}
          <div className="inv-meta">
            {/* Bill To */}
            <div className="meta-block">
              <div className="meta-label">Bill To</div>
              <div className="meta-name">
                {customer?.first_name} {customer?.last_name}
              </div>
              {customer?.email && <div className="meta-line">{customer.email}</div>}
              {customer?.phone && <div className="meta-line">{customer.phone}</div>}
            </div>

            {/* Ship To */}
            <div className="meta-block">
              <div className="meta-label">Ship To</div>
              {shipping_address ? (
                <>
                  <div className="meta-name">{customer?.first_name} {customer?.last_name}</div>
                  <div className="meta-line">{shipping_address.street_address}</div>
                  <div className="meta-line">
                    {shipping_address.city}{shipping_address.state_province ? `, ${shipping_address.state_province}` : ''} {shipping_address.postal_code}
                  </div>
                  <div className="meta-line">{shipping_address.country}</div>
                </>
              ) : (
                <div className="meta-line" style={{ color:'#c0c0c0' }}>No address on file</div>
              )}
            </div>

            {/* Order Info */}
            <div className="meta-block">
              <div className="meta-label">Order Details</div>
              <div className="meta-line"><b>Order #:</b> {order.order_number}</div>
              <div className="meta-line"><b>Date:</b> {fmtDate(order.created_at)}</div>
              <div className="meta-line"><b>Status:</b> {order.status}</div>
              <div className="meta-line" style={{ textTransform:'capitalize' }}>
                <b>Payment:</b> {order.payment_method?.replace(/_/g,' ')}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="inv-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width:'40%' }}>Description</th>
                  <th>SKU</th>
                  <th className="right">Qty</th>
                  <th className="right">Unit Price</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div className="td-name">{item.product_name}</div>
                    </td>
                    <td><span className="td-sku">{item.product_sku || '—'}</span></td>
                    <td className="right">{item.quantity}</td>
                    <td className="right">{fmt(item.unit_price)}</td>
                    <td className="right" style={{ fontWeight:600, color:'#16163f' }}>
                      {fmt(Number(item.unit_price) * Number(item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="inv-totals">
            <div className="totals-wrap">
              <div className="totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {taxAmount > 0 && <div className="totals-row"><span>Tax</span><span>{fmt(taxAmount)}</span></div>}
              {shippingCost > 0 && <div className="totals-row"><span>Shipping</span><span>{fmt(shippingCost)}</span></div>}
              {discountAmt > 0 && <div className="totals-row discount"><span>Discount</span><span>−{fmt(discountAmt)}</span></div>}
              <div className="totals-row grand"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>

          {/* Shipment info */}
          {shipment && (
            <div className="inv-shipment">
              <div>
                <div className="ship-label">Carrier</div>
                <div className="ship-val">{shipment.carrier || '—'}</div>
              </div>
              <div>
                <div className="ship-label">Tracking Number</div>
                <div className="ship-val">{shipment.tracking_number || '—'}</div>
              </div>
              {shipment.estimated_delivery && (
                <div>
                  <div className="ship-label">Est. Delivery</div>
                  <div className="ship-val">{fmtDate(shipment.estimated_delivery)}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="inv-footer">
            <div className="footer-note">
              Thank you for shopping with TechWholesale.<br />
              Questions? Contact us at hello@techwholesale.com
            </div>
            <div className="footer-brand">Tech<span>Whole</span>sale</div>
          </div>
        </div>
      </div>
    </>
  );
}
