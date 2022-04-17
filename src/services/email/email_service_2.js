function makeEmailService2({ log, ses, emailFrom }) {

    return function emailService() {

        const sendEmail = async (to, event, context) =>  {
            if (!to || to <= 0 || typeof to !== 'string') {
                log.debug(`Cannot send to email address: ${ to }`);
                return;
            }

            const tmplName = event.getSESTmplName();

            try {
                const resp = await ses.sendTemplatedEmail({
                    Source: `mail.karly-capstone.com <${ emailFrom }>`,
                    Destination: {
                        ToAddresses: [ to ]
                    },
                    Template: tmplName,
                    TemplateData: JSON.stringify(context)
                });

                log.info(resp);
            } catch (err) {
                log.error(`Email Send error : ${ err }`);
            }
        };     

        return (Object.freeze({
            sendEmail
        }));
    }
}

module.exports = makeEmailService2;