CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE accounts (
                          id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          account_no   VARCHAR(20) UNIQUE NOT NULL,
                          owner_name   VARCHAR(100) NOT NULL,
                          email        VARCHAR(150) UNIQUE NOT NULL,
                          phone        VARCHAR(15),
                          balance      NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
                          status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                          created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ledger_entry (
                              id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              tx_ref        VARCHAR(30) NOT NULL,
                              account_id    UUID NOT NULL REFERENCES accounts(id),
                              entry_type    VARCHAR(10) NOT NULL,
                              amount        NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
                              balance_after NUMERIC(15, 2) NOT NULL CHECK (balance_after >= 0),
                              description   VARCHAR(255),
                              created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are immutable.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_immutable_update
    BEFORE UPDATE ON ledger_entry
    FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER ledger_immutable_delete
    BEFORE DELETE ON ledger_entry
    FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TABLE transactions (
                              id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              tx_ref          VARCHAR(30) UNIQUE NOT NULL,
                              from_account_id UUID REFERENCES accounts(id),
                              to_account_id   UUID REFERENCES accounts(id),
                              amount          NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
                              status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                              fraud_flagged   BOOLEAN NOT NULL DEFAULT false,
                              otp_verified    BOOLEAN NOT NULL DEFAULT false,
                              description     VARCHAR(255),
                              initiated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                              completed_at    TIMESTAMPTZ
);

CREATE TABLE audit_log (
                           id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           method_name  VARCHAR(200) NOT NULL,
                           class_name   VARCHAR(200) NOT NULL,
                           arguments    TEXT,
                           return_value TEXT,
                           exception    TEXT,
                           duration_ms  BIGINT,
                           created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
                       id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       username     VARCHAR(50) UNIQUE NOT NULL,
                       email        VARCHAR(150) UNIQUE NOT NULL,
                       password     VARCHAR(255) NOT NULL,
                       account_id   UUID REFERENCES accounts(id),
                       role         VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
                       enabled      BOOLEAN NOT NULL DEFAULT true,
                       created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
                                id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                user_id      UUID NOT NULL REFERENCES users(id),
                                token        VARCHAR(500) UNIQUE NOT NULL,
                                expires_at   TIMESTAMPTZ NOT NULL,
                                revoked      BOOLEAN NOT NULL DEFAULT false,
                                created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_holdings (
                                id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                account_id   UUID NOT NULL REFERENCES accounts(id),
                                symbol       VARCHAR(20) NOT NULL,
                                quantity     INTEGER NOT NULL CHECK (quantity >= 0),
                                avg_cost     NUMERIC(15, 2) NOT NULL,
                                created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                                updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                                UNIQUE(account_id, symbol)
);

CREATE INDEX idx_ledger_account ON ledger_entry(account_id);
CREATE INDEX idx_ledger_tx_ref ON ledger_entry(tx_ref);
CREATE INDEX idx_transactions_from ON transactions(from_account_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);