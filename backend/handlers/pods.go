package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"

	"github.com/i-umairkhan/dhcp-flow/db"
	"github.com/i-umairkhan/dhcp-flow/types"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

// pods handler
func PodsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// get pods
		var configOptions types.ConfigOptions
		// query db for config options
		err := db.DB.QueryRow("SELECT namespace, label FROM configOptions").Scan(&configOptions.Namespace, &configOptions.Label)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// read kubeconfig
		currentDir, _ := os.Getwd()
		kubeConfigPath := filepath.Join(currentDir, "data", "kubeConfig.yaml")
		config, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
		if err != nil {
			panic(err.Error())
		}
		// create clientset
		client := kubernetes.NewForConfigOrDie(config)
		// get pods from k8s with namespace and label
		pods, err := client.CoreV1().Pods(configOptions.Namespace).List(context.Background(), metav1.ListOptions{
			LabelSelector: configOptions.Label,
		})
		if err != nil {
			panic(err.Error())
		}

		// send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Pods *v1.PodList `json:"pods"`
		}{Pods: pods})
	}
}
