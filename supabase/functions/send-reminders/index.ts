import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration for re-checkup periods by category (in days)
const RECHECK_THRESHOLDS: Record<string, number> = {
  'ac-repair': 180, // 6 months for dust gathering
  'pest-control': 90, // 3 months
  'cleaning': 30, // 1 month deep clean reminder
  'plumbing': 365, // 1 year checkup
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date()

    const { data: completedJobs, error } = await supabase
      .from('bookings')
      .select('*, customers(phone, name)')
      .eq('status', 'completed')

    if (error) throw error

    let remindersSent = 0
    const reminders = []

    for (const job of completedJobs || []) {
      const thresholdDays = RECHECK_THRESHOLDS[job.category || '']
      if (!thresholdDays) continue

      const completedDate = new Date(job.completed_at || job.created_at)
      const diffTime = Math.abs(today.getTime() - completedDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays >= thresholdDays && !job.reminder_sent) {
        // Send SMS Reminder Mock (e.g. using Twilio)
        const message = `Hello ${job.customers?.name || 'Customer'}, it's been ${thresholdDays} days since your last ${job.service_name}. It might be time for a re-checkup to keep everything running smoothly! Book again at Sahakar Seva.`
        
        console.log(`[SMS MOCK] Sending to ${job.customers?.phone || 'Unknown'}: ${message}`)
        
        // Mark reminder as sent
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', job.id)

        reminders.push({ bookingId: job.id, message })
        remindersSent++
      }
    }

    return new Response(
      JSON.stringify({ message: `Successfully sent ${remindersSent} reminders`, reminders }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
