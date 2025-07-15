import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { orderData, telegramData } = await req.json();

    console.log('Creating order:', { orderData, telegramData });

    // Insert order into database
    const { data: order, error } = await supabaseClient
      .from('orders')
      .insert({
        telegram_user_id: telegramData?.user?.id?.toString() || 'unknown',
        customer_name: orderData.customer_name,
        contact_info: orderData.contact_info,
        service_id: orderData.service_id,
        deadline: orderData.deadline || null,
        notes: orderData.notes || null,
        status: 'new'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Get service details for the response
    const { data: service } = await supabaseClient
      .from('services')
      .select('*')
      .eq('id', orderData.service_id)
      .single();

    // Prepare response data
    const responseData = {
      order,
      service,
      telegramData: {
        user: telegramData?.user || null,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Order created successfully:', responseData);

    return new Response(JSON.stringify({
      success: true,
      data: responseData,
      message: 'Pesanan berhasil dibuat! Tim kami akan menghubungi Anda segera.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Gagal membuat pesanan',
      message: 'Terjadi kesalahan. Silakan coba lagi.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});