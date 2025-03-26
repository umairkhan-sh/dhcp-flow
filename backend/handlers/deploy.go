package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/i-umairkhan/dhcp-flow/db"
	"github.com/i-umairkhan/dhcp-flow/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func DeployHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// quering subnets from db
		rows, err := db.DB.Query("SELECT * FROM subnets WHERE status != 'deleted' ORDER BY subnet ASC")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// send subnets in response
		var subnets []types.Subnet
		for rows.Next() {
			var (
				id     int
				subnet string
				pool   string
				router string
				dns    string
				status string
			)
			rows.Scan(&id, &subnet, &pool, &router, &dns, &status)
			subnets = append(subnets, types.Subnet{ID: id, Subnet: subnet, Pools: []struct {
				Pool string `json:"pool"`
			}{{Pool: pool}}, OptionData: []struct {
				Name string `json:"name"`
				Data string `json:"data"`
			}{
				{Name: "router", Data: router},
				{Name: "dns-server", Data: dns},
			}})
		}
		// query db for config options
		var configOptions types.ConfigOptions
		err = db.DB.QueryRow("SELECT namespace, label FROM configOptions").Scan(&configOptions.Namespace, &configOptions.Label)
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
		// creating new data for keadhcp4.conf
		var keaDhcp4 types.KeaDhcp4
		json.Unmarshal([]byte(configMaps.Items[0].Data["kea-dhcp4.conf"]), &keaDhcp4)
		var convertedSubnets []struct {
			ID     int    `json:"id"`
			Subnet string `json:"subnet"`
			Pools  []struct {
				Pool string `json:"pool"`
			} `json:"pools"`
			OptionData []struct {
				Name string `json:"name"`
				Data string `json:"data"`
			} `json:"option-data"`
		}
		for _, s := range subnets {
			convertedSubnets = append(convertedSubnets, struct {
				ID     int    `json:"id"`
				Subnet string `json:"subnet"`
				Pools  []struct {
					Pool string `json:"pool"`
				} `json:"pools"`
				OptionData []struct {
					Name string `json:"name"`
					Data string `json:"data"`
				} `json:"option-data"`
			}{
				ID:         s.ID,
				Subnet:     s.Subnet,
				Pools:      s.Pools,
				OptionData: s.OptionData,
			})
		}
		keaDhcp4.Dhcp4.Subnet4 = convertedSubnets

		// update configmap data with new data
		// updating only first config map data that has kea-dhcp4.conf with new kea-dhcp4.conf
		keaDhcp4Json, err := json.Marshal(keaDhcp4)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		configMaps.Items[0].Data["kea-dhcp4.conf"] = string(keaDhcp4Json)
		updatedConfigMap, err := client.CoreV1().ConfigMaps(configOptions.Namespace).Update(context.Background(), &configMaps.Items[0], metav1.UpdateOptions{})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		_, err = db.DB.Exec("DELETE FROM subnets")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		fmt.Println(updatedConfigMap)
	}
}
