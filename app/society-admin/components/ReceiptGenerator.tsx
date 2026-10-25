'use client'

import { MaintenanceFeeRecord } from '../lib/maintenanceFeeManager'

interface ReceiptGeneratorProps {
  fee: MaintenanceFeeRecord
  unit: any
  society: any
  payment?: {
    amount: number
    paidDate: string
    paymentMethod: string
  }
}

export const generateReceiptHTML = ({ fee, unit, society, payment }: ReceiptGeneratorProps): string => {
  const receiptDate = payment?.paidDate ? new Date(payment.paidDate) : new Date()
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatTime = (date: Date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance Fee Receipt</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .receipt-container { max-width: 800px; margin: 20px auto; background: white; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
        .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
        .society-name { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .society-details { font-size: 12px; color: #6b7280; line-height: 1.5; }
        .receipt-title { font-size: 18px; font-weight: bold; color: #4f46e5; margin: 20px 0; text-align: center; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 12px; font-weight: bold; color: #4f46e5; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .label { font-size: 12px; color: #6b7280; font-weight: 500; }
        .value { font-size: 13px; color: #1f2937; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 12px; font-weight: bold; color: #374151; border: 1px solid #e5e7eb; }
        td { padding: 10px; border: 1px solid #e5e7eb; font-size: 13px; color: #1f2937; }
        td.right { text-align: right; }
        .amount { font-weight: bold; color: #059669; }
        .total-row { background: #f0fdf4; font-weight: bold; }
        .status-paid { color: #059669; font-weight: bold; }
        .status-partial { color: #d97706; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; line-height: 1.6; }
        .receipt-no { background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0; text-align: center; font-size: 12px; font-family: monospace; }
        .print-note { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 10px; }
        @media print {
            body { background: white; }
            .receipt-container { box-shadow: none; padding: 0; }
            .print-note { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <!-- Header -->
        <div class="header">
            <div class="society-name">${society?.name || 'Society'}</div>
            <div class="society-details">
                ${society?.address || 'Address not provided'}<br>
                ${society?.city ? society.city + ', ' : ''}${society?.state || ''}<br>
                ${society?.phone || 'N/A'}
            </div>
        </div>

        <div class="receipt-title">MAINTENANCE FEE RECEIPT</div>

        <!-- Unit & Fee Info -->
        <div class="section">
            <div class="section-title">Unit Information</div>
            <div class="info-row">
                <div>
                    <div class="label">Unit Number</div>
                    <div class="value">${unit?.unitNumber || 'N/A'}</div>
                </div>
                <div>
                    <div class="label">Unit Type</div>
                    <div class="value">${(unit?.unitType || '').toUpperCase() || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- Fee Details Table -->
        <div class="section">
            <div class="section-title">Fee Details</div>
            <table>
                <tr>
                    <th>Description</th>
                    <th class="right">Amount</th>
                </tr>
                <tr>
                    <td>Maintenance Fee for ${fee.month}</td>
                    <td class="right amount">₹${fee.totalAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td>Total Due Amount</td>
                    <td class="right amount">₹${fee.totalAmount.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <!-- Payment Details -->
        <div class="section">
            <div class="section-title">Payment Information</div>
            <table>
                <tr>
                    <th>Particulars</th>
                    <th class="right">Amount</th>
                </tr>
                <tr>
                    <td>Payment Received</td>
                    <td class="right amount">₹${payment?.amount.toFixed(2) || fee.paidAmount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Payment Method</td>
                    <td class="right">${payment?.paymentMethod ? payment.paymentMethod.replace('-', ' ').toUpperCase() : 'N/A'}</td>
                </tr>
                <tr>
                    <td>Payment Date</td>
                    <td class="right">${formatDate(receiptDate)}</td>
                </tr>
                <tr class="total-row">
                    <td>Outstanding Balance</td>
                    <td class="right amount">₹${Math.max(0, fee.totalAmount - (payment?.amount || fee.paidAmount)).toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <!-- Status -->
        <div class="section">
            <div class="section-title">Payment Status</div>
            <table>
                <tr>
                    <td>Total Amount Due</td>
                    <td class="right amount">₹${fee.totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Amount Paid (Till Date)</td>
                    <td class="right" style="color: #059669; font-weight: bold;">₹${fee.paidAmount.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td>Remaining Amount</td>
                    <td class="right">${fee.remainingAmount > 0 ? `<span style="color: #dc2626; font-weight: bold;">₹${fee.remainingAmount.toFixed(2)}</span>` : '<span style="color: #059669; font-weight: bold;">PAID</span>'}</td>
                </tr>
            </table>
        </div>

        <!-- Receipt Number -->
        <div class="receipt-no">
            Receipt ID: ${fee.id}<br>
            Generated: ${formatDate(receiptDate)} at ${formatTime(receiptDate)}
        </div>

        <!-- Footer -->
        <div class="footer">
            <strong>Thank You for Your Payment!</strong><br>
            This is a computer-generated receipt and does not require a signature.<br>
            For queries, please contact the society administration.<br>
            <div class="print-note" style="margin-top: 15px;">
                Print this receipt for your records
            </div>
        </div>
    </div>

    <script>
        // Auto-print on load for direct printing from system
        // window.print();
    </script>
</body>
</html>
  `
}

export default function ReceiptGenerator({ fee, unit, society, payment }: ReceiptGeneratorProps) {
  const handlePrint = () => {
    const html = generateReceiptHTML({ fee, unit, society, payment })
    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const html = generateReceiptHTML({ fee, unit, society, payment })
      
      // Create a blob from HTML
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Open in new tab (user can then print to PDF)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    } catch (error) {
      console.error('[v0] PDF download error:', error)
    }
  }

  const handleEmail = async () => {
    try {
      const html = generateReceiptHTML({ fee, unit, society, payment })
      
      // Store for email (in real app, would send to backend)
      const emailData = {
        to: unit?.residents?.[0]?.email || '',
        subject: `Maintenance Fee Receipt - ${fee.month} - ${unit?.unitNumber}`,
        html: html,
        attachmentId: fee.id
      }
      
      console.log('[v0] Email receipt data:', emailData)
      alert('Receipt email feature would send to resident email')
    } catch (error) {
      console.error('[v0] Email error:', error)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePrint}
        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors font-medium"
      >
        Print Receipt
      </button>
      <button
        onClick={handleDownloadPDF}
        className="flex-1 px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 transition-colors font-medium"
      >
        Download PDF
      </button>
      <button
        onClick={handleEmail}
        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors font-medium"
      >
        Send Email
      </button>
    </div>
  )
}
