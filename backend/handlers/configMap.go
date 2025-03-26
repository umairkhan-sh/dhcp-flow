package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/i-umairkhan/dhcp-flow/db"
	"github.com/i-umairkhan/dhcp-flow/types"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/remotecommand"
)

// struct for kea-dhcp.conf file
type Keadhcp4ConfFile struct {
	Keadhcp4Conf string `json:"kea-dhcp4.conf"`
}

// configmap handler
func ConfigMapHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// get configmap
		// query db for config options
		var configOptions types.ConfigOptions
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
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// create clientset
		client := kubernetes.NewForConfigOrDie(config)
		// get configmaps from k8s with namespace and label
		configMaps, err := client.CoreV1().ConfigMaps(configOptions.Namespace).List(context.Background(), metav1.ListOptions{
			LabelSelector: configOptions.Label,
		})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send response
		// sending only first config map data that has kea-dhcp4.conf
		var keadhcp4Conf map[string]interface{}
		json.Unmarshal([]byte(configMaps.Items[0].Data["kea-dhcp4.conf"]), &keadhcp4Conf)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(keadhcp4Conf)

	} else if r.Method == "POST" {
		// update configmap data
		var keadhcp4Conf map[string]interface{}
		err := json.NewDecoder(r.Body).Decode(&keadhcp4Conf)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		data, _ := (json.Marshal(keadhcp4Conf))
		fmt.Println(string(data))

		// // query db for config options
		var configOptions types.ConfigOptions
		err = db.DB.QueryRow("SELECT namespace, label FROM configOptions").Scan(&configOptions.Namespace, &configOptions.Label)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// // read kubeconfig
		currentDir, _ := os.Getwd()
		kubeConfigPath := filepath.Join(currentDir, "data", "kubeConfig.yaml")
		config, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// // create clientset
		client := kubernetes.NewForConfigOrDie(config)
		// // get configmaps from k8s with namespace and label
		configMaps, err := client.CoreV1().ConfigMaps(configOptions.Namespace).List(context.Background(), metav1.ListOptions{
			LabelSelector: configOptions.Label,
		})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// // update configmap data with new data
		// // updating only first config map data that has kea-dhcp4.conf with new kea-dhcp4.conf
		configMaps.Items[0].Data["kea-dhcp4.conf"] = string(data)
		updatedConfigMap, err := client.CoreV1().ConfigMaps(configOptions.Namespace).Update(context.Background(), &configMaps.Items[0], metav1.UpdateOptions{})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// RUNNING COMMANDS INSIDE PODS
		pods, err := client.CoreV1().Pods(configOptions.Namespace).List(context.Background(), metav1.ListOptions{
			LabelSelector: configOptions.Label,
		})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		for _, v := range pods.Items {
			command1 := strings.Fields(`bash /scripts/fetch_cm.sh`)
			command2 := strings.Fields(`bash /scripts/config-reload.sh`)

			req1 := client.CoreV1().RESTClient().
				Post().
				Resource("pods").
				Name(v.Name).
				Namespace(configOptions.Namespace).
				SubResource("exec").
				VersionedParams(&corev1.PodExecOptions{
					Container: "kea-dhcp4",
					Command:   command1,
					Stdin:     true,
					Stdout:    true,
					Stderr:    true,
					TTY:       false,
				}, scheme.ParameterCodec)
			req2 := client.CoreV1().RESTClient().
				Post().
				Resource("pods").
				Name(v.Name).
				Namespace(configOptions.Namespace).
				SubResource("exec").
				VersionedParams(&corev1.PodExecOptions{
					Container: "kea-dhcp4",
					Command:   command2,
					Stdin:     true,
					Stdout:    true,
					Stderr:    true,
					TTY:       false,
				}, scheme.ParameterCodec)

			remotecommand.NewSPDYExecutor(config, "POST", req1.URL())
			remotecommand.NewSPDYExecutor(config, "POST", req2.URL())
		}
		_, err = db.DB.Exec("DELETE FROM subnets")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		AddSubnetsFromConfigToDB(w, r)

		// // send updated kea-dhcp4.conf
		json.Unmarshal([]byte(updatedConfigMap.Data["kea-dhcp4.conf"]), &keadhcp4Conf)
		// // send response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(keadhcp4Conf)
	}
}
