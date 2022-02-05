function makeEmailService({ log, transporter }) {
    return function emailService() {

        const sendEmail = async to =>  {
            if (!to || to <= 0 || typeof to !== 'string') {
                return;
            }

            try {
                let info = await transporter.sendEmail({
                    from: 'Karly Capstone <karlycapstone@gmail.com>',
                    to,
                    subject: "hello",
                    text: "Hello World!",
                    html: "<b>Hello There you!</b>"
                });
            } catch (err) {
                log.error(`Email Error on send : ${ err }`);
            }
        };     

        return (Object.freeze({
            sendEmail
        }));
    }
}

module.exports = makeEmailService;