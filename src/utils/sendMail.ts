export class SendMail {
  sendMail = async (mailOption) => {   
    try {
      const nodemailer = require('nodemailer');

      const transport = nodemailer.createTransport({
        host: 'mail.maychuviet.com',
        port: 587,
        tls: {
          ciphers: 'SSLv3',
        },
        secureConnection: false, // true for 465, false for other ports
        auth: {
          user: 'no-reply@itnow.vn', // generated ethereal user
          pass: '3F79sRZt/f', // generated ethereal password
        },
      });
      const optionMail = {
        from: 'no-reply@itnow.vn <no-reply@itnow.vn>',
        to: mailOption.to,
        subject: mailOption.subjects,
        html: mailOption.html,
      };
      console.log(optionMail);

      const result = await transport.sendMail(optionMail);

      return result;
    } catch (error) {
      return console.log(error);
    }
  };
}
