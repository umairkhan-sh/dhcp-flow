-- users table for authentication
CREATE TABLE users (
    username TEXT PRIMARY KEY, 
    password TEXT
);

-- configOptions table for storing configuration options 
CREATE TABLE configOptions (
    namespace TEXT, 
    label TEXT
);

-- subnet table for storing subnets
CREATE TABLE subnets (
    id INTEGER PRIMARY KEY,
    subnet TEXT UNIQUE,
    pool TEXT,
    router TEXT,
    dns TEXT,
    status TEXT
);
-- enable Write-Ahead Logging (WAL) mode
PRAGMA journal_mode=WAL;

-- insert default user and config options
INSERT INTO users (username, password) VALUES ('admin', 'admin');
INSERT INTO configOptions (namespace, label) VALUES ('default', 'app=kea-dhcp4');