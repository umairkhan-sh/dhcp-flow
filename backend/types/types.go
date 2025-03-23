package types

// type for kea-dhcp4.conf
type KeaDhcp4 struct {
	Dhcp4 struct {
		Allocator        string `json:"allocator"`
		InterfacesConfig struct {
			Interfaces     []string `json:"interfaces"`
			DhcpSocketType string   `json:"dhcp-socket-type"`
		} `json:"interfaces-config"`
		MultiThreading struct {
			EnableMultiThreading bool `json:"enable-multi-threading"`
			ThreadPoolSize       int  `json:"thread-pool-size"`
			PacketQueueSize      int  `json:"packet-queue-size"`
		} `json:"multi-threading"`
		HooksLibraries []struct {
			Library string `json:"library"`
		} `json:"hooks-libraries"`
		Loggers []struct {
			Name          string `json:"name"`
			OutputOptions []struct {
				Output string `json:"output"`
				Maxver int    `json:"maxver,omitempty"`
			} `json:"output_options"`
			Severity string `json:"severity"`
		} `json:"loggers"`
		LeaseDatabase struct {
			Type     string `json:"type"`
			Name     string `json:"name"`
			User     string `json:"user"`
			Password string `json:"password"`
			Host     string `json:"host"`
			Port     int    `json:"port"`
		} `json:"lease-database"`
		ControlSocket struct {
			SocketType string `json:"socket-type"`
			SocketName string `json:"socket-name"`
		} `json:"control-socket"`
		ExpiredLeasesProcessing struct {
			ReclaimTimerWaitTime        int `json:"reclaim-timer-wait-time"`
			FlushReclaimedTimerWaitTime int `json:"flush-reclaimed-timer-wait-time"`
			HoldReclaimedTime           int `json:"hold-reclaimed-time"`
			MaxReclaimLeases            int `json:"max-reclaim-leases"`
			MaxReclaimTime              int `json:"max-reclaim-time"`
			UnwarnedReclaimCycles       int `json:"unwarned-reclaim-cycles"`
		} `json:"expired-leases-processing"`
		RenewTimer    int `json:"renew-timer"`
		RebindTimer   int `json:"rebind-timer"`
		ValidLifetime int `json:"valid-lifetime"`
		Subnet4       []struct {
			ID     int    `json:"id"`
			Subnet string `json:"subnet"`
			Pools  []struct {
				Pool string `json:"pool"`
			} `json:"pools"`
			OptionData []struct {
				Name string `json:"name"`
				Data string `json:"data"`
			} `json:"option-data"`
		} `json:"subnet4"`
	} `json:"Dhcp4"`
}

// type for a subnet
type Subnet struct {
	ID     int    `json:"id"`
	Subnet string `json:"subnet"`
	Pools  []struct {
		Pool string `json:"pool"`
	} `json:"pools"`
	OptionData []struct {
		Name string `json:"name"`
		Data string `json:"data"`
	} `json:"option-data"`
	Status string `json:"status"`
}

// type for config options
type ConfigOptions struct {
	Namespace string `json:"namespace"`
	Label     string `json:"label"`
}
