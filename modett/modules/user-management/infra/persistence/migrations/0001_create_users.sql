-- SQL migration: create users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  roles VARCHAR(100)[],
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
