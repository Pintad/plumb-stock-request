
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

    const { data, error } = await resend.emails.send({
      from: 'Lovable <onboarding@resend.dev>',
      to: [clientEmail],
      subject: `🎉 Votre commande #${orderNumber} est prête !`,
      html: `
        <h1>Votre commande est prête !</h1>
        <p>Bonjour,</p>
        <p>Nous vous informons que votre commande #${orderNumber} est prête à être retirée.</p>
        <p>Vous pouvez venir la récupérer pendant nos horaires d'ouverture.</p>
        <p>Merci de votre confiance !</p>
      `
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true }), {
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
