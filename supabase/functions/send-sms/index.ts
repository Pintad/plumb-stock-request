import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, orderNumber } = await req.json()
    
    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`SMS request for order ${orderNumber}:`)
    console.log(`- Phone: ${phoneNumber}`)
    console.log(`- Message: ${message}`)

    // Simulate SMS sending for now
    // In a real implementation, you would integrate with an SMS provider like:
    // - Twilio
    // - Amazon SNS
    // - Orange SMS API
    // - OVH SMS API
    // etc.
    
    console.log('SMS would be sent to:', phoneNumber)
    console.log('Message content:', message)
    
    // For demonstration purposes, we'll simulate a successful response
    const response = {
      success: true,
      phoneNumber: phoneNumber,
      message: message,
      orderNumber: orderNumber,
      sentAt: new Date().toISOString(),
      provider: 'simulated',
      note: 'This is a simulated SMS. To send real SMS, integrate with an SMS provider in this edge function.'
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-sms function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})