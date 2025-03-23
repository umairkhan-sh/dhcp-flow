package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/i-umairkhan/dhcp-flow/db"
	"github.com/i-umairkhan/dhcp-flow/types"
)

// config options handler
func ConfigOptionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// get config options
		var configOptions types.ConfigOptions
		// query db for config options
		err := db.DB.QueryRow("SELECT namespace, label FROM configOptions").Scan(&configOptions.Namespace, &configOptions.Label)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(configOptions)
	} else if r.Method == "POST" {
		// update config options
		var configOptions types.ConfigOptions
		err := json.NewDecoder(r.Body).Decode(&configOptions)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(err.Error()))
			return
		}
		// update config options in db
		_, err = db.DB.Exec("UPDATE configOptions SET namespace = $1, label = $2", &configOptions.Namespace, &configOptions.Label)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(configOptions)
	} else {
		// method not allowed
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(struct {
			Message string `json:"message"`
		}{Message: "Method not allowed"})
	}
}
