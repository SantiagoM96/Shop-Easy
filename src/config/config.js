const config = () => {
    return {
        port: process.env.PORT,
        mongoDbHost: process.env.MONGODB_HOST,
        mongoDbPassword: process.env.MONGODB_PASSWORD,
        mongoDbUser: process.env.MONGODB_USER,
        mongoDbName: process.env.MONGODB_NAME,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        privateKey: process.env.PRIVATE_KEY,
        jwtKey: process.env.JWT_KEY,
        emailUser: process.env.EMAIL_USER,
        passUser: process.env.PASS_USER,
        environment: process.env.ENVIRONMENT,
        adminId: process.env.ADMIN_ID,
        adminUser: process.env.ADMIN_USER,
        adminPassword: process.env.ADMIN_PASSWORD,
        stripeKey: process.env.STRIPE_KEY
    }
}
module.exports = config