// Runs every minute (pg_cron). Sends due reminders as Web Push to each person's phones.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('forbidden', { status: 401 });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC')!, Deno.env.get('VAPID_PRIVATE')!);

  const now = Date.now();
  const { data: due, error } = await db.from('reminders').update({ sent: true })
    .eq('sent', false).lte('fire_at', new Date(now).toISOString()).gt('fire_at', new Date(now - 15 * 60e3).toISOString()).select();
  if (error) return new Response(error.message, { status: 500 });
  await db.from('reminders').delete().lt('fire_at', new Date(now - 2 * 864e5).toISOString());

  const logs: Record<string, Record<string, string>> = {};
  let sent = 0;
  for (const r of due ?? []) {
    if (r.task_id && r.task_date) {
      if (!(r.task_date in logs)) {
        const { data } = await db.from('kv').select('value').eq('key', 'log/' + r.task_date).maybeSingle();
        logs[r.task_date] = data?.value ?? {};
      }
      if (logs[r.task_date][r.task_id]) continue; // already done or awaiting verification
    }
    const { data: subs } = await db.from('push_subs').select('endpoint,sub').eq('person', r.person);
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(s.sub, JSON.stringify({ title: r.title, body: r.body, tag: r.id }));
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) await db.from('push_subs').delete().eq('endpoint', s.endpoint);
      }
    }
  }
  return new Response(JSON.stringify({ due: due?.length ?? 0, sent }), { headers: { 'content-type': 'application/json' } });
});
