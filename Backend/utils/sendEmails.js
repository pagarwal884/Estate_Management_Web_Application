const sendEmail = async (options) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim()

        if(!BREVO_API_KEY){
            console.error("missing BREVO_API_KEY in .env file")
            throw new error("Missing Email Api Key")
        }

        const data = {
            sender: {
                name: "Real Estate Platform",
                email: "process.env.EMAIL_USER"
            },
            to: [{email: options.email}],
            subject: options.subject,
            htmlContent: options.message
        }
         const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key" : BREVO_API_KEY,
                "Content-Type": "application/json" ,
                "Accept": "application/json" 
            },
            body: JSON.stringify(data),

    });

    const result = await response.json()

    if(response.ok){
        console.log("Email sent successfully via Bravo", result.messageId)
    } else{
        console.error("Bravo API Key Error:", result)
        throw new Error(result.message || "Could not send email via Brevo")
    }
    } catch (error) {
         console.error("Bravo Email Error:", result)
        throw new Error("Could not send email via Brevo")
    }
}

export default sendEmail