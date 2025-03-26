package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/i-umairkhan/dhcp-flow/db"
	"github.com/i-umairkhan/dhcp-flow/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

// subnets handler
func SubnetsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// get subnets
		// this functions adds subnets from configmap to db
		AddSubnetsFromConfigToDB(w, r)
		// quering subnets from db
		rows, err := db.DB.Query("SELECT * FROM subnets ORDER BY subnet ASC")
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
			}, Status: status})
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Data []types.Subnet `json:"subnets"`
		}{Data: subnets})
	} else if r.Method == "POST" {
		// post subnets
		// this functions adds subnets from configmap to db
		AddSubnetsFromConfigToDB(w, r)
		// subnet from request body
		var subnet types.Subnet
		err := json.NewDecoder(r.Body).Decode(&subnet)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(err.Error()))
			return
		}
		// inserting subnet into db
		_, err = db.DB.Exec("INSERT INTO subnets (subnet, pool, router, dns, status) VALUES ($1, $2, $3, $4, $5)", subnet.Subnet, subnet.Pools[0].Pool, subnet.OptionData[0].Data, subnet.OptionData[1].Data, "local")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// quering subnets from db
		rows, err := db.DB.Query("SELECT * FROM subnets ORDER BY subnet ASC")
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
			}, Status: status})
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Data []types.Subnet `json:"subnets"`
		}{Data: subnets})
	} else if r.Method == "PUT" {
		// update subnet
		// this functions adds subnets from configmap to db
		AddSubnetsFromConfigToDB(w, r)
		// subnet from request body
		var subnet types.Subnet
		err := json.NewDecoder(r.Body).Decode(&subnet)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(err.Error()))
			return
		}
		// inserting subnet into db
		_, err = db.DB.Exec("UPDATE subnets SET subnet = $2, pool = $3, router = $4, dns = $5, status = $6 WHERE id = $1", subnet.Subnet, subnet.Pools[0].Pool, subnet.OptionData[0].Data, subnet.OptionData[1].Data, "local", subnet.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// quering subnets from db
		rows, err := db.DB.Query("SELECT * FROM subnets ORDER BY subnet ASC")
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
			}, Status: status})
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Data []types.Subnet `json:"subnets"`
		}{Data: subnets})
	} else if r.Method == "DELETE" {
		// delete subnet
		// this functions adds subnets from configmap to db
		AddSubnetsFromConfigToDB(w, r)
		var subnet struct {
			ID int `json:"id"`
		}
		err := json.NewDecoder(r.Body).Decode(&subnet)

		body, _ := io.ReadAll(r.Body)
		fmt.Printf("Raw body: %s\n", body)

		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(err.Error()))
			return
		}
		// deleting subnet from db
		_, err = db.DB.Exec("UPDATE subnets SET status = $1 WHERE id = $2", "deleted", subnet.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		// quering subnets from db
		rows, err := db.DB.Query("SELECT * FROM subnets ORDER BY subnet ASC")
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
			}, Status: status})
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Data []types.Subnet `json:"subnets"`
		}{Data: subnets})
	} else if r.Method == "PATCH" {
		_, err := db.DB.Exec("DELETE FROM subnets")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		AddSubnetsFromConfigToDB(w, r)
		// quering subnets from db
		rows, err := db.DB.Query("SELECT * FROM subnets ORDER BY subnet ASC")
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
			}, Status: status})
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Data []types.Subnet `json:"subnets"`
		}{Data: subnets})
	}
}

// this function adds subnets from configmap to db
func AddSubnetsFromConfigToDB(w http.ResponseWriter, r *http.Request) {
	// query db for config options
	var configOptions types.ConfigOptions
	err := db.DB.QueryRow("SELECT namespace, label FROM configOptions").Scan(&configOptions.Namespace, &configOptions.Label)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	// read kubeconfig.yaml
	currentDir, _ := os.Getwd()
	kubeConfigPath := filepath.Join(currentDir, "data", "kubeConfig.yaml")
	config, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}
	// create client
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
	// storing kea-dhcp4.conf file from configmap to struct keadhcp4
	var keaDhcp4 types.KeaDhcp4
	json.Unmarshal([]byte(configMaps.Items[0].Data["kea-dhcp4.conf"]), &keaDhcp4)
	// inserting subnets from struct keaDhcp4 to db
	for _, v := range keaDhcp4.Dhcp4.Subnet4 {
		_, err = db.DB.Exec("INSERT OR IGNORE INTO subnets (id, subnet, pool, router, dns, status) VALUES ($1, $2, $3, $4, $5, $6)", v.ID, v.Subnet, v.Pools[0].Pool, v.OptionData[0].Data, v.OptionData[1].Data, "running")
	}
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

}
