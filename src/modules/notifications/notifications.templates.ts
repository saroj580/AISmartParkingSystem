interface LayoutInput {
  title: string;
  bodyHtml: string;
}

function layout({ title, bodyHtml }: LayoutInput): string {
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; background:#f4f5f7; margin:0; padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111827;color:#ffffff;padding:20px 24px;">
        <h1 style="margin:0;font-size:18px;">Smart Parking</h1>
      </div>
      <div style="padding:24px;color:#111827;">
        <h2 style="margin-top:0;font-size:16px;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 24px;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;">
        This is an automated message from Smart Parking Management System.
      </div>
    </div>
  </body>
</html>`;
}

export const emailTemplates = {
  welcome(firstName: string) {
    return layout({
      title: `Welcome, ${firstName}!`,
      bodyHtml: `<p>Your Smart Parking account has been created successfully. You can now search for parking, book spaces, and manage your vehicles.</p>`,
    });
  },

  bookingConfirmation(params: {
    firstName: string;
    bookingNumber: string;
    lotName: string;
    spaceCode: string;
    startTime: string;
    endTime: string;
  }) {
    return layout({
      title: "Booking Confirmed",
      bodyHtml: `
        <p>Hi ${params.firstName}, your booking <strong>${params.bookingNumber}</strong> is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <tr><td style="padding:4px 0;color:#6b7280;">Location</td><td style="padding:4px 0;text-align:right;">${params.lotName}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Space</td><td style="padding:4px 0;text-align:right;">${params.spaceCode}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">From</td><td style="padding:4px 0;text-align:right;">${params.startTime}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">To</td><td style="padding:4px 0;text-align:right;">${params.endTime}</td></tr>
        </table>`,
    });
  },

  paymentConfirmation(params: { firstName: string; amount: string; currency: string; invoiceNumber: string }) {
    return layout({
      title: "Payment Received",
      bodyHtml: `<p>Hi ${params.firstName}, we've received your payment of <strong>${params.amount} ${params.currency.toUpperCase()}</strong>. Invoice: ${params.invoiceNumber}.</p>`,
    });
  },

  bookingReminder(params: { firstName: string; bookingNumber: string; startTime: string; lotName: string }) {
    return layout({
      title: "Upcoming Booking Reminder",
      bodyHtml: `<p>Hi ${params.firstName}, your booking <strong>${params.bookingNumber}</strong> at ${params.lotName} starts at ${params.startTime}. Don't forget to check in with your QR code.</p>`,
    });
  },

  bookingExpiry(params: { firstName: string; bookingNumber: string }) {
    return layout({
      title: "Booking Expired",
      bodyHtml: `<p>Hi ${params.firstName}, your unpaid booking <strong>${params.bookingNumber}</strong> has expired and the space has been released.</p>`,
    });
  },

  checkIn(params: { firstName: string; bookingNumber: string; lotName: string }) {
    return layout({
      title: "Checked In",
      bodyHtml: `<p>Hi ${params.firstName}, you've successfully checked in for booking <strong>${params.bookingNumber}</strong> at ${params.lotName}.</p>`,
    });
  },

  checkOut(params: { firstName: string; bookingNumber: string; lotName: string }) {
    return layout({
      title: "Checked Out",
      bodyHtml: `<p>Hi ${params.firstName}, you've successfully checked out of booking <strong>${params.bookingNumber}</strong> at ${params.lotName}. Thanks for parking with us!</p>`,
    });
  },

  refundConfirmation(params: { firstName: string; amount: string; currency: string }) {
    return layout({
      title: "Refund Processed",
      bodyHtml: `<p>Hi ${params.firstName}, a refund of <strong>${params.amount} ${params.currency.toUpperCase()}</strong> has been issued to your original payment method.</p>`,
    });
  },

  operatorAlert(params: { firstName: string; message: string }) {
    return layout({
      title: "Operator Alert",
      bodyHtml: `<p>Hi ${params.firstName}, ${params.message}</p>`,
    });
  },
};
