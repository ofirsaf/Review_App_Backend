const nodemailer = require("nodemailer");

exports.genertaeMailTrapTransport = () =>
  nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "49f9a49857201d",
      pass: "279e1a584fe815",
    },
  });
