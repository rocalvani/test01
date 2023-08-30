import config from "../config/config.js";
import twilio from 'twilio';

const twilioClient = twilio(config.twilioAccountSID, config.twilioAuthToken);
const twilioSMSOptions = {
    body: "Esto es un mensaje SMS de prueba usando Twilio desde Coderhouse.",
    from: config.twilioSmsNumber,
    to: config.twilioToSmsNumber
}

export const sendSMS = async (req, res) => {
    // Logica
    try {
        req.logger.info(`Testing Twilio SMS @ ${req.method} ${req.url}` )
        const result = await twilioClient.messages.create(twilioSMSOptions);
        res.send({ status: "success", payload: result });
    } catch (error) {
        req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
        res.status(500).send({ error: error });
    }
}