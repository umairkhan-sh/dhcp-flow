package db

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

// db connection object
var DB *sql.DB

// initializing db connection
func InitDB() {
	var err error
	// connecting to sqlite db
	DB, err = sql.Open("sqlite3", "/home/umair/dev/dhcp-flow/db/dhcp-flow.db")
	if err != nil {
		panic(err)
	}
}
