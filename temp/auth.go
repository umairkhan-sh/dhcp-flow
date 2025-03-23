package handlers

// import (
// 	"encoding/json"
// 	"net/http"

// 	"github.com/i-umairkhan/dhcp-flow/db"
// )

// // user struct
// type User struct {
// 	Username string `json:"username"`
// 	Password string `json:"password"`
// }

// // signin handler
// func SignIn(w http.ResponseWriter, r *http.Request) {
// 	if r.Method == "POST" {
// 		var user User
// 		err := json.NewDecoder(r.Body).Decode(&user)
// 		if err != nil {
// 			w.WriteHeader(400)
// 			w.Write([]byte(err.Error()))
// 			return
// 		}
// 		if user.Username == "" || user.Password == "" {
// 			w.WriteHeader(400)
// 			w.Write([]byte("Username or password cannot be empty"))
// 			return
// 		}
// 		err = db.DB.QueryRow("SELECT username FROM users WHERE username = $1 AND password = $2", user.Username, user.Password).Scan(&user.Username)
// 		if err != nil {
// 			w.WriteHeader(401)
// 			w.Write([]byte("Invalid username or password"))
// 			return
// 		}
// 		w.WriteHeader(200)
// 		w.Header().Set("Access-Control-Allow-Origin", "*")
// 		w.Write([]byte("Signin successful"))
// 	} else {
// 		w.WriteHeader(405)
// 		w.Write([]byte("Method not allowed"))
// 	}
// }
