-- CreditBoost PostgreSQL Database Schema
-- A comprehensive financial platform with Universal Credit Passport

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Audit trail function and trigger
CREATE SCHEMA audit;

CREATE TABLE audit.logs (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    user_id TEXT,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    query TEXT,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_name ON audit.logs(table_name);
CREATE INDEX idx_audit_logs_user_id ON audit.logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit.logs(action);
CREATE INDEX idx_audit_logs_changed_at ON audit.logs(changed_at);

CREATE OR REPLACE FUNCTION audit.create_audit_trigger(target_table regclass) RETURNS VOID AS $$
DECLARE
    trigger_name TEXT;
BEGIN
    SELECT format('%s_audit_trigger', target_table::TEXT) INTO trigger_name;
    
    EXECUTE format('
        CREATE TRIGGER %I
        AFTER INSERT OR UPDATE OR DELETE ON %s
        FOR EACH ROW
        EXECUTE PROCEDURE audit.audit_trigger_func();
    ', trigger_name, target_table);
    
    RAISE NOTICE 'Created audit trigger % on table %', trigger_name, target_table;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION audit.audit_trigger_func() RETURNS TRIGGER AS $$
DECLARE
    audit_row audit.logs%ROWTYPE;
    excluded_cols TEXT[] = ARRAY[]::TEXT[];
    included_cols TEXT[];
    column_name TEXT;
    client_query TEXT;
    current_user_id TEXT;
BEGIN
    client_query := current_query();
    
    -- Try to get user ID from application context
    BEGIN
        current_user_id := current_setting('app.current_user_id', true);
    EXCEPTION
        WHEN OTHERS THEN
            current_user_id := session_user::TEXT;
    END;

    audit_row.table_name := TG_TABLE_NAME::TEXT;
    audit_row.user_id := current_user_id;
    audit_row.query := client_query;
    audit_row.changed_at := NOW();

    IF (TG_OP = 'INSERT') THEN
        audit_row.action := 'INSERT';
        audit_row.new_data := to_jsonb(NEW);
        
        INSERT INTO audit.logs
        (table_name, user_id, action, new_data, query, changed_at)
        VALUES
        (audit_row.table_name, audit_row.user_id, audit_row.action, 
         audit_row.new_data, audit_row.query, audit_row.changed_at);
        
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        audit_row.action := 'UPDATE';
        audit_row.old_data := to_jsonb(OLD);
        audit_row.new_data := to_jsonb(NEW);
        
        INSERT INTO audit.logs
        (table_name, user_id, action, old_data, new_data, query, changed_at)
        VALUES
        (audit_row.table_name, audit_row.user_id, audit_row.action, 
         audit_row.old_data, audit_row.new_data, audit_row.query, audit_row.changed_at);
        
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        audit_row.action := 'DELETE';
        audit_row.old_data := to_jsonb(OLD);
        
        INSERT INTO audit.logs
        (table_name, user_id, action, old_data, query, changed_at)
        VALUES
        (audit_row.table_name, audit_row.user_id, audit_row.action, 
         audit_row.old_data, audit_row.query, audit_row.changed_at);
        
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Core Tables --

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(100) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    photo_url VARCHAR(255),
    date_of_birth DATE,
    national_id VARCHAR(50),
    country_code VARCHAR(3),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User Authentication
CREATE TABLE user_auth (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
    auth_provider_id VARCHAR(255),
    auth_provider_data JSONB,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    recovery_codes JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, auth_provider)
);

CREATE INDEX idx_user_auth_user_id ON user_auth(user_id);

-- User Settings
CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications JSONB NOT NULL DEFAULT '{
        "emailUpdates": true, 
        "creditScoreChanges": true, 
        "newLearningContent": false, 
        "desktopNotifications": true, 
        "soundNotifications": false
    }'::JSONB,
    preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
    privacy_settings JSONB NOT NULL DEFAULT '{
        "shareData": false,
        "anonymizedAnalytics": true,
        "marketingCommunications": false
    }'::JSONB,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- User Addresses
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL DEFAULT 'primary' CHECK (address_type IN ('primary', 'mailing', 'billing', 'work', 'other')),
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_method VARCHAR(50),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Credit Score history
CREATE TABLE credit_scores (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    score_type VARCHAR(50) NOT NULL DEFAULT 'internal',
    score_factors JSONB,
    score_provider VARCHAR(100) NOT NULL DEFAULT 'CreditBoost',
    previous_score INTEGER,
    score_change INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX idx_credit_scores_score_date ON credit_scores(score_date);
CREATE INDEX idx_credit_scores_score_type ON credit_scores(score_type);

-- Credit Data Sources
CREATE TABLE credit_data_sources (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('mpesa', 'bank_statement', 'credit_card', 'loan', 'utility', 'other')),
    source_name VARCHAR(100) NOT NULL,
    source_description TEXT,
    connection_type VARCHAR(50) NOT NULL CHECK (connection_type IN ('file_upload', 'api', 'manual_entry', 'oauth')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('connected', 'pending', 'disconnected', 'error')),
    last_update TIMESTAMP WITH TIME ZONE,
    connection_details JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_data_sources_user_id ON credit_data_sources(user_id);
CREATE INDEX idx_credit_data_sources_source_type ON credit_data_sources(source_type);
CREATE INDEX idx_credit_data_sources_status ON credit_data_sources(status);

-- Credit Data Uploads
CREATE TABLE credit_data_uploads (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_id BIGINT REFERENCES credit_data_sources(id),
    source_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    hash_checksum VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    processing_step VARCHAR(50) DEFAULT 'uploading',
    error TEXT,
    metadata JSONB
);

CREATE INDEX idx_credit_data_uploads_user_id ON credit_data_uploads(user_id);
CREATE INDEX idx_credit_data_uploads_source_type ON credit_data_uploads(source_type);
CREATE INDEX idx_credit_data_uploads_status ON credit_data_uploads(status);
CREATE INDEX idx_credit_data_uploads_uploaded_at ON credit_data_uploads(uploaded_at);

-- Financial Transactions
CREATE TABLE financial_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upload_id BIGINT REFERENCES credit_data_uploads(id) ON DELETE SET NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_expense BOOLEAN,
    is_income BOOLEAN,
    recipient_name VARCHAR(255),
    recipient_account VARCHAR(100),
    sender_name VARCHAR(255),
    sender_account VARCHAR(100),
    balance_after DECIMAL(19, 4),
    transaction_id VARCHAR(100),
    source VARCHAR(50) NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_upload_id ON financial_transactions(upload_id);
CREATE INDEX idx_financial_transactions_transaction_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_transaction_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category);
CREATE INDEX idx_financial_transactions_is_expense ON financial_transactions(is_expense);
CREATE INDEX idx_financial_transactions_is_income ON financial_transactions(is_income);
CREATE INDEX idx_financial_transactions_source ON financial_transactions(source);

-- Transaction Categories
CREATE TABLE transaction_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES transaction_categories(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income', 'transfer', 'other')),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transaction_categories_parent_id ON transaction_categories(parent_id);
CREATE INDEX idx_transaction_categories_type ON transaction_categories(type);

-- Chat Histories
CREATE TABLE chat_histories (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL,
    share_token VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_histories_user_id ON chat_histories(user_id);
CREATE INDEX idx_chat_histories_share_token ON chat_histories(share_token);

-- Chat History Upload Mappings
CREATE TABLE chat_history_uploads (
    chat_history_id BIGINT NOT NULL REFERENCES chat_histories(id) ON DELETE CASCADE,
    upload_id BIGINT NOT NULL REFERENCES credit_data_uploads(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_history_id, upload_id)
);

-- Chat Messages
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    chat_history_id BIGINT NOT NULL REFERENCES chat_histories(id) ON DELETE CASCADE,
    message_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'ai')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_chat_messages_chat_history_id ON chat_messages(chat_history_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender);

-- Learning Topics
CREATE TABLE learning_topics (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    creator_id VARCHAR(100) NOT NULL DEFAULT 'admin',
    rating DECIMAL(3, 2),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    icon VARCHAR(50),
    color VARCHAR(20),
    position INTEGER NOT NULL DEFAULT 0,
    estimated_duration INTEGER, -- in minutes
    tags JSONB
);

CREATE INDEX idx_learning_topics_difficulty ON learning_topics(difficulty);
CREATE INDEX idx_learning_topics_is_active ON learning_topics(is_active);

-- Learning Quizzes
CREATE TABLE learning_quizzes (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    estimated_time INTEGER, -- in minutes
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    points INTEGER NOT NULL DEFAULT 100,
    max_attempts INTEGER,
    time_limit INTEGER, -- in minutes
    passing_score INTEGER NOT NULL DEFAULT 70,
    show_results BOOLEAN NOT NULL DEFAULT TRUE,
    cooldown_period INTEGER, -- in hours
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_learning_quizzes_topic_id ON learning_quizzes(topic_id);
CREATE INDEX idx_learning_quizzes_difficulty ON learning_quizzes(difficulty);
CREATE INDEX idx_learning_quizzes_is_active ON learning_quizzes(is_active);

-- Quiz Questions
CREATE TABLE quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES learning_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(10) NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- User Quiz Progress
CREATE TABLE user_quiz_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES learning_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    time_spent INTEGER, -- in seconds
    answers JSONB,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    UNIQUE (user_id, quiz_id, attempt_number)
);

CREATE INDEX idx_user_quiz_progress_user_id ON user_quiz_progress(user_id);
CREATE INDEX idx_user_quiz_progress_quiz_id ON user_quiz_progress(quiz_id);
CREATE INDEX idx_user_quiz_progress_status ON user_quiz_progress(status);

-- Universal Credit Passport System --

-- Institutions table for verifying entities
CREATE TABLE institutions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('bank', 'credit_bureau', 'government', 'utility', 'employer', 'microfinance', 'telco', 'other')),
    country_code VARCHAR(3) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    verification_level VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_level IN ('pending', 'basic', 'verified', 'premium', 'revoked')),
    api_key VARCHAR(255),
    api_secret_hash VARCHAR(255),
    public_key TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(100),
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    terms_version VARCHAR(20)
);

CREATE INDEX idx_institutions_type ON institutions(type);
CREATE INDEX idx_institutions_country_code ON institutions(country_code);
CREATE INDEX idx_institutions_verification_level ON institutions(verification_level);
CREATE INDEX idx_institutions_status ON institutions(status);

-- Institution Users (staff of verifying institutions)
CREATE TABLE institution_users (
    id BIGSERIAL PRIMARY KEY,
    institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'verifier', 'viewer', 'api')),
    department VARCHAR(100),
    phone VARCHAR(50),
    last_login_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    recovery_codes JSONB,
    api_access BOOLEAN NOT NULL DEFAULT FALSE,
    api_key VARCHAR(255),
    api_key_expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (institution_id, email)
);

CREATE INDEX idx_institution_users_institution_id ON institution_users(institution_id);
CREATE INDEX idx_institution_users_email ON institution_users(email);
CREATE INDEX idx_institution_users_role ON institution_users(role);
CREATE INDEX idx_institution_users_status ON institution_users(status);

-- Credit Passports
CREATE TABLE credit_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passport_number VARCHAR(50) NOT NULL UNIQUE,
    blockchain_id VARCHAR(255) UNIQUE, -- Ethereum address or token ID
    ipfs_hash VARCHAR(255), -- IPFS content hash for passport document
    issuance_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'suspended')),
    version INTEGER NOT NULL DEFAULT 1,
    credit_score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
    data_sources JSONB,
    passport_data JSONB,
    template_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    revocation_reason TEXT,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by VARCHAR(100),
    last_verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_credit_passports_user_id ON credit_passports(user_id);
CREATE INDEX idx_credit_passports_passport_number ON credit_passports(passport_number);
CREATE INDEX idx_credit_passports_blockchain_id ON credit_passports(blockchain_id);
CREATE INDEX idx_credit_passports_status ON credit_passports(status);
CREATE INDEX idx_credit_passports_issuance_date ON credit_passports(issuance_date);
CREATE INDEX idx_credit_passports_expiration_date ON credit_passports(expiration_date);
CREATE INDEX idx_credit_passports_credit_score ON credit_passports(credit_score);

-- Institution Verifications (stamps on passports)
CREATE TABLE passport_verifications (
    id BIGSERIAL PRIMARY KEY,
    passport_id UUID NOT NULL REFERENCES credit_passports(id) ON DELETE CASCADE,
    institution_id BIGINT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    verifier_id BIGINT REFERENCES institution_users(id) ON DELETE SET NULL,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('identity', 'credit', 'income', 'employment', 'address', 'assets', 'general')),
    verification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiration_date TIMESTAMP WITH TIME ZONE,
    verification_data JSONB,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired', 'revoked')),
    blockchain_tx_hash VARCHAR(255),
    digital_signature TEXT,
    public_key_used TEXT,
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('manual', 'api', 'blockchain')),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (passport_id, institution_id, verification_type)
);

CREATE INDEX idx_passport_verifications_passport_id ON passport_verifications(passport_id);
CREATE INDEX idx_passport_verifications_institution_id ON passport_verifications(institution_id);
CREATE INDEX idx_passport_verifications_verification_type ON passport_verifications(verification_type);
CREATE INDEX idx_passport_verifications_verification_status ON passport_verifications(verification_status);
CREATE INDEX idx_passport_verifications_verification_date ON passport_verifications(verification_date);
CREATE INDEX idx_passport_verifications_blockchain_tx_hash ON passport_verifications(blockchain_tx_hash);

-- Passport Access Logs (who viewed passports)
CREATE TABLE passport_access_logs (
    id BIGSERIAL PRIMARY KEY,
    passport_id UUID NOT NULL REFERENCES credit_passports(id) ON DELETE CASCADE,
    accessor_type VARCHAR(50) NOT NULL CHECK (accessor_type IN ('user', 'institution', 'api', 'share_link')),
    accessor_id VARCHAR(255) NOT NULL, -- user_id, institution_id, api_key_id, or share_token
    access_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT,
    access_type VARCHAR(50) NOT NULL CHECK (access_type IN ('view', 'download', 'verify', 'share')),
    access_status VARCHAR(20) NOT NULL CHECK (access_status IN ('success', 'denied')),
    denied_reason TEXT,
    access_details JSONB,
    location_data JSONB
);

CREATE INDEX idx_passport_access_logs_passport_id ON passport_access_logs(passport_id);
CREATE INDEX idx_passport_access_logs_accessor_type ON passport_access_logs(accessor_type);
CREATE INDEX idx_passport_access_logs_accessor_id ON passport_access_logs(accessor_id);
CREATE INDEX idx_passport_access_logs_access_date ON passport_access_logs(access_date);
CREATE INDEX idx_passport_access_logs_access_type ON passport_access_logs(access_type);
CREATE INDEX idx_passport_access_logs_access_status ON passport_access_logs(access_status);

-- Passport Sharing (granular permission control)
CREATE TABLE passport_shares (
    id BIGSERIAL PRIMARY KEY,
    passport_id UUID NOT NULL REFERENCES credit_passports(id) ON DELETE CASCADE,
    share_token VARCHAR(100) NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('individual', 'institution')),
    recipient_institution_id BIGINT REFERENCES institutions(id) ON DELETE SET NULL,
    access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('view_only', 'verify', 'full')),
    sections_shared JSONB NOT NULL DEFAULT '["all"]'::JSONB,
    max_views INTEGER,
    view_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'used')),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    requires_authentication BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_passport_shares_passport_id ON passport_shares(passport_id);
CREATE INDEX idx_passport_shares_share_token ON passport_shares(share_token);
CREATE INDEX idx_passport_shares_created_by ON passport_shares(created_by);
CREATE INDEX idx_passport_shares_recipient_email ON passport_shares(recipient_email);
CREATE INDEX idx_passport_shares_expires_at ON passport_shares(expires_at);
CREATE INDEX idx_passport_shares_status ON passport_shares(status);

-- Document Templates
CREATE TABLE document_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('passport', 'report', 'certificate', 'statement')),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    country_code VARCHAR(3),
    html_template TEXT NOT NULL,
    css_styles TEXT,
    default_variables JSONB,
    template_version VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    thumbnail_url VARCHAR(255),
    supports_verification BOOLEAN NOT NULL DEFAULT TRUE,
    supports_digital_signature BOOLEAN NOT NULL DEFAULT TRUE,
    passport_type VARCHAR(50) CHECK (passport_type IN ('standard', 'premium', 'enterprise')),
    document_orientation VARCHAR(20) NOT NULL DEFAULT 'portrait' CHECK (document_orientation IN ('portrait', 'landscape')),
    security_features JSONB
);

CREATE INDEX idx_document_templates_type ON document_templates(type);
CREATE INDEX idx_document_templates_language ON document_templates(language);
CREATE INDEX idx_document_templates_country_code ON document_templates(country_code);
CREATE INDEX idx_document_templates_is_active ON document_templates(is_active);
CREATE INDEX idx_document_templates_passport_type ON document_templates(passport_type);

-- Generated Documents
CREATE TABLE generated_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passport_id UUID REFERENCES credit_passports(id) ON DELETE CASCADE,
    template_i

