import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId } = await req.json()
    if (!bookingId) throw new Error('bookingId is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, customers(name, phone, address), workers(name)')
      .eq('id', bookingId)
      .single()

    if (error || !booking) throw new Error('Booking not found')

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const { width, height } = page.getSize()

    const drawText = (text: string, x: number, y: number, font = helvetica, size = 12, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y, size, font, color })
    }

    // Header
    drawText('SAHAKAR SEVA', 50, height - 50, helveticaBold, 24, rgb(0.1, 0.1, 0.5))
    drawText('Tax Invoice', 50, height - 75, helveticaBold, 16)
    
    // Invoice Details
    drawText(`Invoice No: INV-${booking.id.slice(0, 8)}`, 400, height - 50, helvetica, 10)
    drawText(`Date: ${new Date().toLocaleDateString()}`, 400, height - 65, helvetica, 10)

    // Customer Details
    drawText('Bill To:', 50, height - 120, helveticaBold, 12)
    drawText(booking.customers?.name || 'Customer', 50, height - 140, helvetica, 12)
    drawText(booking.customers?.phone || '', 50, height - 155, helvetica, 10)
    drawText(booking.customers?.address || '', 50, height - 170, helvetica, 10)

    // Service Details
    drawText('Service Description', 50, height - 220, helveticaBold, 12)
    drawText('Amount', 450, height - 220, helveticaBold, 12)
    page.drawLine({ start: { x: 50, y: height - 230 }, end: { x: 550, y: height - 230 }, thickness: 1 })

    drawText(booking.service_name || booking.category, 50, height - 250, helvetica, 12)
    
    const basePrice = booking.total_price || 0
    const gstRate = 0.18 // 18% GST
    const gstAmount = basePrice * gstRate
    const totalAmount = basePrice + gstAmount

    drawText(`Rs ${basePrice.toFixed(2)}`, 450, height - 250, helvetica, 12)

    page.drawLine({ start: { x: 350, y: height - 300 }, end: { x: 550, y: height - 300 }, thickness: 1 })
    
    drawText('Subtotal:', 350, height - 320, helvetica, 12)
    drawText(`Rs ${basePrice.toFixed(2)}`, 450, height - 320, helvetica, 12)
    
    drawText('GST (18%):', 350, height - 340, helvetica, 12)
    drawText(`Rs ${gstAmount.toFixed(2)}`, 450, height - 340, helvetica, 12)

    page.drawLine({ start: { x: 350, y: height - 360 }, end: { x: 550, y: height - 360 }, thickness: 2 })

    drawText('Total:', 350, height - 380, helveticaBold, 14)
    drawText(`Rs ${totalAmount.toFixed(2)}`, 450, height - 380, helveticaBold, 14)

    // Footer
    drawText('Thank you for choosing Sahakar Seva!', 50, 50, helvetica, 12)
    drawText('For queries, contact support@sahakarseva.com', 50, 35, helvetica, 10)

    const pdfBytes = await pdfDoc.save()

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${bookingId}.pdf"`,
      },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
