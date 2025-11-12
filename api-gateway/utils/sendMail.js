import transporter from '../config/email.js';

const sendMail = async function sendTheEmailToTarget (receiver, content, webPage) {
        try {
                if (!receiver || !content || !webPage)
                        throw new Error("MISSING_INPUT");
                await transporter.verify();
                console.log("Successfully connected to email server");
                const email = await transporter.sendMail({
                        from: `Your life coach todoApp :) <${process.env.EMAIL_GMAIL_USER}>`,
                        to: receiver,
                        subject: content,
                        html: webPage
                });
                console.log("Email sent successfully");
                return (true);
        } catch (err) {
                console.error("Error sending email:", err.message);
                return (false);
        }
};

export default sendMail;
