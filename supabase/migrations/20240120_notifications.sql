-- Create user_notification_settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  inapp_enabled BOOLEAN DEFAULT true,
  notify_all_updates BOOLEAN DEFAULT false,
  quiet_hours_start INT CHECK (quiet_hours_start >= 0 AND quiet_hours_start <= 23),
  quiet_hours_end INT CHECK (quiet_hours_end >= 0 AND quiet_hours_end <= 23),
  language_preference TEXT DEFAULT 'et', -- 'et' or 'ru'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for settings
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- shipment_status, eta_change, action_required, partial_delivery, system
  severity TEXT NOT NULL, -- info, warning, action_required, error
  title_key TEXT,
  body_key TEXT,
  title_text TEXT, -- Fallback or direct text
  body_text TEXT, -- Fallback or direct text
  payload JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  channels TEXT[] DEFAULT '{inapp}', -- e.g. ['inapp', 'email']
  dedup_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create notification_events table (log)
CREATE TABLE IF NOT EXISTS notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- inapp, email
  status TEXT NOT NULL, -- queued, sent, failed
  provider TEXT,
  provider_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for notification_events (Users might not need to see this, but helpful for debugging/history)
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their notifications"
  ON notification_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notifications
      WHERE notifications.id = notification_events.notification_id
      AND notifications.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
