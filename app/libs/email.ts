import nodemailer from 'nodemailer';


type profile = { name: string; email: string };

interface EmailOptions {
    profile: profile;
    subject: "verification" | "forget-password" | "password-changed",
    linkUrl?: string;
}

const generateMailTransporter = () => {
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "97660b6cb9ed0a",
          pass: "73db3b51b7eb5b"
        }
      });

      return transport;
}

const sendEmailVerificationLink = async (profile: profile, linkUrl: string) => {

    try {

        const transport = generateMailTransporter();

          await transport.sendMail({
            from: "admin@nextecommerce.com",
            to: profile?.email,
            subject: "Account Registration",
            html: `<h1>Please verify your account by clicking on 
                    <a href="${linkUrl}"> this link!</a> </h1>`
          });
        
    } catch (error) {
        throw error;
    }


}

const sendForgetPasswordLink = async (profile: profile, linkUrl: string) => {

    try {

        const transport = generateMailTransporter();

          await transport.sendMail({
            from: "admin@nextecommerce.com",
            to: profile?.email,
            subject: "Account Registration",
            html: `<h1>Click on this link
            <a href="${linkUrl}"> to reset your password!</a> </h1>`
          });
        
    } catch (error) {
        throw error;
    }


}

const sendUpdatePasswordLink = async (profile: profile) => {

    try {

        const transport = generateMailTransporter();

          await transport.sendMail({
            from: "admin@nextecommerce.com",
            to: profile?.email,
            subject: "Account Registration",
            html: `<h1>We changed your password <a href="${process.env.SIGN_IN_URL}">Click Here!</a> </h1>`
          });
        
    } catch (error) {
        throw error;
    }


}

export const sendMail = (options: EmailOptions) => {
    const { profile, subject, linkUrl} = options;

    switch(subject) {
        case "verification":
            return sendEmailVerificationLink(profile, linkUrl!);
        case "forget-password":
            return sendForgetPasswordLink(profile, linkUrl!);
        case "password-changed":
            return sendUpdatePasswordLink(profile);
    }
} 