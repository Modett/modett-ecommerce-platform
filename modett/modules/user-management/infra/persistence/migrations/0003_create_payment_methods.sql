-- SQL migration: create payment_methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
