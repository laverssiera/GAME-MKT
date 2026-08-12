-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'cold' CHECK (status IN ('cold', 'warm', 'hot', 'qualified')),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    description TEXT,
    features TEXT,  -- JSON serialized
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bundles table (Service Composer)
CREATE TABLE IF NOT EXISTS bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    margin_percentage INTEGER DEFAULT 40,
    products TEXT,  -- JSON serialized array of product IDs
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Composer Executions table
CREATE TABLE IF NOT EXISTS composer_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID NOT NULL,
    customer_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'created' CHECK (status IN ('created', 'in_progress', 'rescheduled', 'completed')),
    progress INTEGER DEFAULT 0,
    current_phase VARCHAR(255),
    timeline_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timeline_end TIMESTAMP,
    teams_active TEXT,  -- JSON serialized array
    risks TEXT,  -- JSON serialized array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_bundles_template_type ON bundles(template_type);
CREATE INDEX IF NOT EXISTS idx_bundles_status ON bundles(status);
CREATE INDEX IF NOT EXISTS idx_exec_bundle_id ON composer_executions(bundle_id);
CREATE INDEX IF NOT EXISTS idx_exec_status ON composer_executions(status);
CREATE INDEX IF NOT EXISTS idx_leads_score_status ON leads(score, status);
CREATE INDEX IF NOT EXISTS idx_bundles_price_margin ON bundles(total_price, margin_percentage);
CREATE INDEX IF NOT EXISTS idx_exec_timeline_end ON composer_executions(timeline_end);

-- Trigger to auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bundles_updated_at BEFORE UPDATE ON bundles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exec_updated_at BEFORE UPDATE ON composer_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
