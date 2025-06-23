// utils/pdfReceipt.js

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceiptPDF = async (donation, outputPath) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Optional Logo (Replace with your actual path or URL if needed)
    const logoPath = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [80, 80], align: 'center' });
      doc.moveDown(0.5);
    }

    // Header
    doc
      .fontSize(22)
      .fillColor('#333')
      .text('GiveHeartedly', { align: 'center' })
      .moveDown(0.2)
      .fontSize(16)
      .text('Official Donation Receipt', { align: 'center' })
      .moveDown(1);

    // Divider line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown(1);

    // Donation Details
    doc.fontSize(12).fillColor('#000');

    const formatAmount = (amt) => `$${amt.toFixed(2)}`;
    const formattedDate = new Date(donation.date).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short'
    });

    const info = [
      { label: 'Receipt ID', value: donation.sessionId },
      { label: 'Date', value: formattedDate },
      { label: 'Donor Name', value: donation.name || 'N/A' },
      { label: 'Donor Email', value: donation.email },
      { label: 'Campaign Title', value: donation.campaignTitle },
      { label: 'Amount Donated', value: formatAmount(donation.amount) },
      { label: 'Currency', value: donation.currency.toUpperCase() },
    ];

    info.forEach(item => {
      doc
        .font('Helvetica-Bold')
        .text(`${item.label}:`, { continued: true })
        .font('Helvetica')
        .text(` ${item.value}`)
        .moveDown(0.5);
    });

    doc
      .font('Helvetica-Oblique')
      .fontSize(11)
      .fillColor('#444')
      .text('This donation is tax-deductible to the extent permitted by law.', {
        align: 'center'
      })
      .moveDown(0.5)
      .text('Thank you for your generous contribution.', {
        align: 'center'
      });

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor('#aaa')
      .text('GiveHeartedly • giveheartedly.org • support@giveheartedly.org', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', (err) => reject(err));
  });
};

module.exports = { generateReceiptPDF };
