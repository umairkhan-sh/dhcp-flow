package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
)

// kubeconfig handler
func KubeConfigHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		// upload kubeconfig
		// limit upload file size to 10MB
		r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
		uploadedfile, _, err := r.FormFile("kubeConfig")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		defer uploadedfile.Close()
		createdFile, err := os.Create("kubeConfig.yaml")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		defer createdFile.Close()
		// copy uploaded file to created file
		_, err = io.Copy(createdFile, uploadedfile)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Message string `json:"message"`
		}{Message: "KubeConfig uploaded"})
	} else if r.Method == "GET" {
		// get kubeconfig
		// read kubeconfig
		kubeconfig, err := os.ReadFile("kubeConfig.yaml")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			KubeConfig string `json:"kubeConfig"`
		}{KubeConfig: string(kubeconfig)})

	} else if r.Method == "DELETE" {
		// delete kubeconfig
		err := os.Remove("kubeConfig.yaml")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Message string `json:"message"`
		}{Message: "KubeConfig deleted"})
	} else {
		// method not allowed
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(struct {
			Message string `json:"message"`
		}{Message: "Method not allowed"})
	}
}
