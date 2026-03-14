import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Verify the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError?.message)
      return new Response(JSON.stringify({ error: 'Unauthorized: ' + (userError?.message || 'invalid token') }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { plan } = await req.json()
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch payment settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('payment_settings')
      .select('key, value')

    if (settingsError) {
      console.error('Settings error:', settingsError.message)
      return new Response(JSON.stringify({ error: 'Failed to load settings' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const settings: Record<string, string> = {}
    ;(settingsData || []).forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value
    })

    const planId = plan === 'monthly' ? settings.monthly_plan_id : settings.yearly_plan_id
    if (!planId) {
      return new Response(JSON.stringify({ error: 'Subscription plan not configured for ' + plan }), {
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

    const auth = btoa(`${keyId}:${keySecret}`)

    // Fetch user profile for customer details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, phone')
      .eq('id', user.id)
      .single()

    const customerEmail = profile?.email || user.email || ''
    const customerName = profile?.full_name || ''
    const customerPhone = profile?.phone || ''

    // Step 1: Create or find a Razorpay customer
    let customerId = ''

    // Check if customer already exists by email
    const customerSearchRes = await fetch(
      `https://api.razorpay.com/v1/customers?email=${encodeURIComponent(customerEmail)}`,
      { headers: { 'Authorization': `Basic ${auth}` } }
    )

    if (customerSearchRes.ok) {
      const searchBody = await customerSearchRes.json()
      if (searchBody.items && searchBody.items.length > 0) {
        customerId = searchBody.items[0].id
      }
    }

    // If no existing customer, create one
    if (!customerId) {
      const createCustomerRes = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
          notes: { user_id: user.id },
        }),
      })

      if (createCustomerRes.ok) {
        const customerBody = await createCustomerRes.json()
        customerId = customerBody.id
      } else {
        console.error('Failed to create customer:', await createCustomerRes.text())
      }
    }

    // Step 2: Create subscription with customer info
    const totalCount = plan === 'monthly' ? 12 : 5

    const subscriptionBody: Record<string, unknown> = {
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: user.id,
        email: customerEmail,
        plan: plan,
      },
    }

    // Attach customer if we have one
    if (customerId) {
      subscriptionBody.customer_id = customerId
    }

    const razorpayRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(subscriptionBody),
    })

    const razorpayBody = await razorpayRes.json()

    if (!razorpayRes.ok) {
      console.error('Razorpay error:', JSON.stringify(razorpayBody))
      return new Response(JSON.stringify({
        error: razorpayBody?.error?.description || 'Failed to create subscription',
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      subscription_id: razorpayBody.id,
      plan,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error: ' + String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
