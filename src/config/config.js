import dotenv from "dotenv";
import program from '../process.js'

const environment = program.opts().mode
dotenv.config({
    path: environment === "prod" ? "./src/config/.env.prod" : "./src/config/.env.dev"
})

export default {
    port: process.env.PORT,
    DB: process.env.db,
    persistence: program.opts().dao,
    environment: environment,
    adminName: process.env.ADMIN,
    adminPassword: process.env.ADMIN_PASSWORD,
    gmailAccount: process.env.GMAIL_ACCOUNT,
    gmailAppPassword: process.env.GMAIL_PASSWORD,
    twilioAccountSID: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioSmsNumber: process.env.TWILIO_SMS_NUMBER,
    twilioToSmsNumber: process.env.TWILIO_TO_SMS_NUMBER,
    stripeSecretKey: process.env.STRIPE_APP_SECRET_KEY,

}