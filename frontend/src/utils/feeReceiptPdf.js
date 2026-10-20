import { jsPDF } from "jspdf";

/**
 * Generates and downloads a clean, professional PDF receipt for hostel fee payments.
 * @param {Object} payment - The payment object (amount, receiptNo, transactionId, paymentMethod, paidAt)
 * @param {Object} fee - The parent fee invoice (feeType, academicYear, term, totalAmount, paidAmount)
 * @param {Object} student - The student profile (Name, Rollno, Roomno, Block, Course)
 */
export function generateFeeReceiptPdf(payment, fee, student = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary colors
  const primaryColor = [235, 128, 85]; // #EB8055 Warm Orange
  const darkColor = [47, 41, 37]; // #2F2925
  const creamColor = [253, 240, 220]; // #FDF0DC
  const grayColor = [139, 115, 85]; // #8B7355
  const greenColor = [22, 101, 52]; // #166534

  // Outer Decorative Border
  doc.setDrawColor(232, 216, 196);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(235, 128, 85);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header Banner
  doc.setFillColor(...creamColor);
  doc.rect(10.5, 10.5, pageWidth - 21, 35, "F");

  // Top Accent Strip
  doc.setFillColor(...primaryColor);
  doc.rect(10.5, 10.5, pageWidth - 21, 3, "F");

  // Institution Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...darkColor);
  doc.text("KIET GROUP OF INSTITUTIONS", pageWidth / 2, 22, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("HOSTEL ADMINISTRATION & FINANCE DIVISION", pageWidth / 2, 29, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text("Main Campus • Official Digital Payment Voucher & Receipt", pageWidth / 2, 35, { align: "center" });

  doc.setDrawColor(232, 216, 196);
  doc.setLineWidth(0.5);
  doc.line(15, 46, pageWidth - 15, 46);

  // Receipt Number & Date Header Strip
  const receiptNo = payment.receiptNo || `RCP-${Date.now().toString().slice(-6)}`;
  const paidDateStr = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text("RECEIPT NO:", 16, 54);
  doc.setTextColor(...darkColor);
  doc.text(receiptNo, 43, 54);

  doc.setTextColor(...grayColor);
  doc.text("DATE & TIME:", pageWidth - 80, 54);
  doc.setTextColor(...darkColor);
  doc.text(paidDateStr, pageWidth - 55, 54);

  // Student & Invoice Details Section Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(232, 216, 196);
  doc.roundedRect(15, 60, pageWidth - 30, 42, 3, 3, "FD");

  // Subheading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("STUDENT & ALLOCATION DETAILS", 20, 67);

  // Column 1
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text("Student Roll No:", 20, 75);
  doc.text("Student Name:", 20, 83);
  doc.text("Hostel & Room:", 20, 91);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text(String(student.Rollno || fee.studentRollno || "—").toUpperCase(), 52, 75);
  doc.text(String(student.Name || "Hostel Resident"), 52, 83);
  doc.text(
    `Block ${student.Block || "—"}  •  Room ${student.Roomno || "—"}`,
    52,
    91
  );

  // Column 2
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayColor);
  doc.text("Academic Year:", pageWidth / 2 + 5, 75);
  doc.text("Fee Category:", pageWidth / 2 + 5, 83);
  doc.text("Billing Term:", pageWidth / 2 + 5, 91);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text(String(fee.academicYear || "2025-2026"), pageWidth / 2 + 35, 75);
  doc.text(String(fee.feeType || "Hostel Fee"), pageWidth / 2 + 35, 83);
  doc.text(String(fee.term || "Full Year"), pageWidth / 2 + 35, 91);

  // Payment Breakdown Table
  const tableY = 110;
  doc.setFillColor(...creamColor);
  doc.rect(15, tableY, pageWidth - 30, 9, "F");
  doc.setDrawColor(232, 216, 196);
  doc.rect(15, tableY, pageWidth - 30, 9, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text("ITEM DESCRIPTION", 20, tableY + 6);
  doc.text("TOTAL BILLED", 105, tableY + 6, { align: "right" });
  doc.text("PAID AMOUNT", 145, tableY + 6, { align: "right" });
  doc.text("BALANCE DUE", pageWidth - 20, tableY + 6, { align: "right" });

  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(15, tableY + 9, pageWidth - 30, 16, "F");
  doc.setDrawColor(232, 216, 196);
  doc.rect(15, tableY + 9, pageWidth - 30, 16, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`${fee.feeType} (${fee.term || fee.academicYear})`, 20, tableY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text(`Hostel clearance receipt voucher`, 20, tableY + 21);

  // Numbers
  const totalBilled = Number(fee.totalAmount || 0);
  const paidThisTxn = Number(payment.amount || 0);
  const remainingBal = Math.max(0, totalBilled - Number(fee.paidAmount || 0));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`INR ${totalBilled.toLocaleString("en-IN")}`, 105, tableY + 18, { align: "right" });

  doc.setTextColor(...greenColor);
  doc.text(`INR ${paidThisTxn.toLocaleString("en-IN")}`, 145, tableY + 18, { align: "right" });

  doc.setTextColor(remainingBal > 0 ? 184 : 22, remainingBal > 0 ? 82 : 101, remainingBal > 0 ? 40 : 52);
  doc.text(`INR ${remainingBal.toLocaleString("en-IN")}`, pageWidth - 20, tableY + 18, { align: "right" });

  // Transaction Breakdown Box
  const txnBoxY = 142;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(232, 216, 196);
  doc.roundedRect(15, txnBoxY, pageWidth - 30, 32, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text("TRANSACTION REFERENCE & PAYMENT DETAILS", 20, txnBoxY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text("Payment Mode:", 20, txnBoxY + 16);
  doc.text("UTR / Transaction ID:", 20, txnBoxY + 23);
  doc.text("Payment Status:", 20, txnBoxY + 30);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text(payment.paymentMethod || "Online / UPI", 60, txnBoxY + 16);
  doc.text(payment.transactionId || `TXN-UPI-${Date.now().toString().slice(-8)}`, 60, txnBoxY + 23);

  doc.setTextColor(...greenColor);
  doc.text("SUCCESSFUL / SETTLED IN FULL", 60, txnBoxY + 30);

  // OFFICIAL VERIFIED STAMP BADGE
  const stampX = pageWidth - 65;
  const stampY = 185;
  doc.setDrawColor(...greenColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(stampX, stampY, 50, 22, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...greenColor);
  doc.text("OFFICIAL RECEIPT", stampX + 25, stampY + 6, { align: "center" });

  doc.setFontSize(11);
  doc.text("PAID & VERIFIED", stampX + 25, stampY + 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("KIET HOSTEL ACCOUNTS", stampX + 25, stampY + 18, { align: "center" });

  // Notes & Disclaimer
  const footerY = 220;
  doc.setDrawColor(232, 216, 196);
  doc.setLineWidth(0.4);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text("Terms & Verification Guidelines:", 15, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text("1. This is an authentic computer-generated digital receipt issued by KIET Hostel Management System.", 15, footerY + 12);
  doc.text("2. Retain this digital receipt number for semester room allotment and clearance verification.", 15, footerY + 17);
  doc.text("3. Any discrepancies must be reported to the Warden / Hostel Accounts Counter within 7 working days.", 15, footerY + 22);

  // Signature lines
  const sigY = 250;
  doc.setDrawColor(...grayColor);
  doc.setLineWidth(0.3);
  doc.line(20, sigY, 65, sigY);
  doc.line(pageWidth - 65, sigY, pageWidth - 20, sigY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text("Student Acknowledgment", 42.5, sigY + 4, { align: "center" });
  doc.text("Hostel Warden / Accounts In-charge", pageWidth - 42.5, sigY + 4, { align: "center" });

  // Bottom Footer
  doc.setFontSize(7);
  doc.text(
    `System Generated on ${new Date().toISOString().slice(0, 10)} • KIET HostelHub Portal`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  // Save the PDF
  const filename = `Hostel_Receipt_${receiptNo}_${String(student.Rollno || fee.studentRollno || "student").toUpperCase()}.pdf`;
  doc.save(filename);
}
