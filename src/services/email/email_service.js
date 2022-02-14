function makeEmailService({ log, transporter, emailFrom }) {

    return function emailService() {

        const sendEmail = async (to, event, context) =>  {
            if (!to || to <= 0 || typeof to !== 'string') {
                log.debug(`Cannot send to email address: ${ to }`);
                return;
            }

            const tmpl = event.getTmpl();

            try {
                transporter.sendMail({
                    from: `karly-capstone.com <${ emailFrom }>`,
                    to,
                    subject: tmpl.getSubject(),
                    // text: "Hello World!",
                    html: tmpl.getHTML(context)
                }, (err, info) => {
                    log.info(info);
                    if (err !== null) log.error(err);
                });
            } catch (err) {
                log.error(`Email Send error : ${ err }`);
            }
        };     

        return (Object.freeze({
            sendEmail
        }));
    }
}

module.exports = makeEmailService;