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
    const { warehouseEmail, orderDisplayTitle, clientName, orderNumber } = await req.json()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(warehouseEmail)) {
      throw new Error(`Invalid email format: ${warehouseEmail}`)
    }

    // Log information for debugging
    console.log(`Sending warehouse notification to: ${warehouseEmail} for order ${orderDisplayTitle}`)

    // Get the official sender email from environment variables
    const fromEmail = Deno.env.get("SENDER_EMAIL")
    if (!fromEmail) {
      console.warn("SENDER_EMAIL environment variable not set, using default")
    }
    
    const senderAddress = fromEmail || 'Lovable <onboarding@resend.dev>'
    console.log(`Using sender email: ${senderAddress}`)

    const { data, error } = await resend.emails.send({
      from: senderAddress,
      to: [warehouseEmail],
      subject: `🔔 Nouvelle commande reçue - ${orderDisplayTitle}`,
      html: `
        <h1>Nouvelle commande reçue</h1>
        <p>Bonjour,</p>
        <p>Une nouvelle commande a été passée et nécessite votre attention :</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Détails de la commande :</h3>
          <ul>
            <li><strong>Numéro de commande :</strong> ${orderNumber}</li>
            <li><strong>Titre d'affichage :</strong> ${orderDisplayTitle}</li>
            <li><strong>Client :</strong> ${clientName}</li>
            <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
          </ul>
        </div>
        <p>Veuillez vous connecter à l'interface de gestion pour traiter cette commande.</p>
        <p>Cordialement,<br>Le système de gestion des commandes</p>
      `
    })

    if (error) {
      // Log detailed error information
      console.error('Error sending warehouse notification:', JSON.stringify(error))
      
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

    console.log('Warehouse notification sent successfully:', JSON.stringify(data))

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error sending warehouse notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})