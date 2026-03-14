import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify the user from the auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { plan } = await req.json()
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch payment settings
    const { data: settingsData } = await supabaseClient
      .from('payment_settings')
      .select('key, value')

    const settings: Record<string, string> = {}
    ;(settingsData || []).forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value
    })

    const planId = plan === 'monthly' ? settings.monthly_plan_id : settings.yearly_plan_id
    if (!planId) {
      return new Response(JSON.stringify({ error: 'Subscription plan not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const keyId = settings.razorpay_key_id
    const keySecret = settings.razorpay_key_secret
    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay keys not configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch user profile for prefill
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name, phone')
      .eq('id', user.id)
      .single()

    // Create subscription via Razorpay API
    const razorpayRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: plan === 'monthly' ? 12 : 1,
        quantity: 1,
        customer_notify: 0,
        notes: {
          user_id: user.id,
          email: profile?.email || user.email,
          plan: plan,
        },
      }),
    })

    if (!razorpayRes.ok) {
      const errBody = await razorpayRes.text()
      console.error('Razorpay error:', errBody)
      return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subscription = await razorpayRes.json()

    return new Response(JSON.stringify({
      subscription_id: subscription.id,
      plan,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
