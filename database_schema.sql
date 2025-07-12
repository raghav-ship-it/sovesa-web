-- Database Schema for QR Scanning System

-- Participants table (if not already exists)
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    student_id VARCHAR(50),
    event VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'registered',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scanned_at TIMESTAMP WITH TIME ZONE,
    scanned_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scan logs table
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    volunteer_id VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) NOT NULL, -- 'attendance' or 'gift'
    status VARCHAR(50) NOT NULL, -- 'success' or 'error'
    message TEXT,
    qr_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift logs table
CREATE TABLE IF NOT EXISTS gift_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    volunteer_id VARCHAR(255) NOT NULL,
    gift_code VARCHAR(100) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'collected',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteers table (if not already exists)
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(100) DEFAULT 'volunteer',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
CREATE INDEX IF NOT EXISTS idx_scan_logs_participant ON scan_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_type ON scan_logs(scan_type);
CREATE INDEX IF NOT EXISTS idx_gift_logs_participant ON gift_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_gift_logs_code ON gift_logs(gift_code);

-- RLS (Row Level Security) policies
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Policies for participants table
CREATE POLICY "Participants are viewable by authenticated users" ON participants
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Participants can be created by authenticated users" ON participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Participants can be updated by service role" ON participants
    FOR UPDATE USING (auth.role() = 'service_role');

-- Policies for scan_logs table
CREATE POLICY "Scan logs are viewable by authenticated users" ON scan_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Scan logs can be created by service role" ON scan_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policies for gift_logs table
CREATE POLICY "Gift logs are viewable by authenticated users" ON gift_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Gift logs can be created by service role" ON gift_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policies for volunteers table
CREATE POLICY "Volunteers are viewable by authenticated users" ON volunteers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Volunteers can be created by authenticated users" ON volunteers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 