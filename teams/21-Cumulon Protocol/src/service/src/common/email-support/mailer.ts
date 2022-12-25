
export class Mailer {
    private nodemailer: any;
    private transporter: any;
    private emailAccount: any;

    constructor(emailConfig: any) {
        this.emailAccount = emailConfig;

        this.nodemailer = require("nodemailer");
        this.transporter = this.nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: this.emailAccount.user, // Your gmail address.
                // Not @developer.gserviceaccount.com
                clientId: this.emailAccount.clientId,
                clientSecret: this.emailAccount.clientSecret,
                refreshToken: this.emailAccount.refreshToken,
                accessToken: this.emailAccount.accessToken
            }
        });
        console.log("init mailer");

    }

    async send(mailOptions: MailOptions): Promise<any> {
        let mailOption = {
            from: '"' + this.emailAccount.name + '" <' + this.emailAccount.user + '>', // sender address
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html || '',
        };

        // send mail with defined transport object 
        let self = this;
        return await this.transporter.sendMail(mailOption, function (error, response) {
            console.log(error);
            console.log(response);
            self.transporter.close();
        });

    }
}
export class MailOptions {
    to!: string;// list of receivers
    subject!: string;// Subject line 
    html?: string;// html body
}