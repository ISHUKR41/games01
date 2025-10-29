-- GameArena Tournament Platform - Storage Setup
-- File: supabase/migrations/004_storage_setup.sql
-- Purpose: Create storage buckets and policies for payment screenshots

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-screenshots',
    'payment-screenshots',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for payment screenshots bucket

-- Allow anyone to upload payment screenshots
CREATE POLICY "Allow anyone to upload payment screenshots" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow anyone to view payment screenshots (public bucket)
CREATE POLICY "Allow anyone to view payment screenshots" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payment-screenshots');

-- Allow admins to delete payment screenshots
CREATE POLICY "Allow admins to delete payment screenshots" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'payment-screenshots' 
        AND has_admin_role(auth.uid())
    );

-- Function to generate secure filename for uploads
CREATE OR REPLACE FUNCTION generate_secure_filename(
    original_filename TEXT,
    user_transaction_id TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_extension TEXT;
    secure_name TEXT;
BEGIN
    -- Extract file extension
    file_extension := lower(substring(original_filename from '\.([^.]*)$'));
    
    -- Generate secure filename with transaction ID and timestamp
    secure_name := user_transaction_id || '_' || 
                  extract(epoch from now())::bigint || 
                  CASE 
                    WHEN file_extension IS NOT NULL THEN '.' || file_extension
                    ELSE '.jpg'
                  END;
    
    RETURN secure_name;
END;
$$ LANGUAGE plpgsql;
