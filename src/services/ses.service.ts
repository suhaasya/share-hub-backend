import { createTransport } from "nodemailer";

class SesService {
  sendEmail = async (toAddresses: string[], subject: string, body: string) => {
    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER_NAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Define the email message
    const mailOptions = {
      from: "suhaskhobragade.scrobits@gmail.com",
      to: toAddresses.join(", "),
      subject: subject,
      html: body,
      attachments: [],
    };

    await transporter.sendMail(mailOptions);
  };
}

export default SesService;
