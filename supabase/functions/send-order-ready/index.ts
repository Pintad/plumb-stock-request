
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { clientEmail, orderNumber } = await req.json()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      throw new Error(`Invalid email format: ${clientEmail}`)
    }

    // Log information for debugging
    console.log(`Attempting to send email to: ${clientEmail} for order #${orderNumber}`)

    // Get the official sender email from environment variables
    const fromEmail = Deno.env.get("SENDER_EMAIL")
    if (!fromEmail) {
      console.warn("SENDER_EMAIL environment variable not set, using default")
    }
    
    const senderAddress = fromEmail || 'Lovable <onboarding@resend.dev>'
    console.log(`Using sender email: ${senderAddress}`)

    const { data, error } = await resend.emails.send({
      from: senderAddress,
      to: [clientEmail],
      subject: `🎉 Votre commande #${orderNumber} est prête !`,
      html: `
        <h1>Votre commande est prête !</h1>
        <p>Bonjour,</p>
        <p>Nous vous informons que votre commande #${orderNumber} est prête à être retirée.</p>
        <p>Vous pouvez venir la récupérer ou contacter votre charger d'aaffaire pour qu'il vous l'apporte a sont prochain passage</p>
        <p>Merci de votre confiance !</p>
      `
    })

    if (error) {
      // Log detailed error information
      console.error('Error sending email:', JSON.stringify(error))
      
      // Special handling for Resend free tier limitation
      if (error.statusCode === 403 && error.message?.includes('You can only send testing emails to your own email address')) {
        return new Response(
          JSON.stringify({ 
            error: "Limitation de compte Resend: Vous ne pouvez envoyer des emails qu'à votre propre adresse jusqu'à ce qu'un domaine soit vérifié.",
            details: error.message,
            success: false,
            simulated: true
          }),
          { 
            status: 200, // Return 200 but with an error message to avoid breaking the UI flow
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      throw error
    }

    console.log('Email sent successfully:', JSON.stringify(data))

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
