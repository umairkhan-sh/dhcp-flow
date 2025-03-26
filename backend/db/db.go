package db

import (
	"database/sql"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// db connection object
var DB *sql.DB

// initializing db connection
func InitDB() {
	var err error
	// connecting to sqlite db
	dbPath := filepath.Join("data", "dhcp-flow.db")
	DB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		panic(err)
	}
}
