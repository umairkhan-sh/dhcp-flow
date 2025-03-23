// keadhcp4config type
export type KeaDhcp4ConfigType = {
    Dhcp4: {
      allocator: string;
      "interfaces-config": {
        interfaces: string[];
        "dhcp-socket-type": string;
      };
      "multi-threading": {
        "enable-multi-threading": boolean;
        "thread-pool-size": number;
        "packet-queue-size": number;
      };
      "hooks-libraries": Array<{
        library: string;
      }>;
      loggers: Array<{
        name: string;
        output_options: Array<{
          output: string;
          maxver?: number;
        }>;
        severity: string;
      }>;
      "lease-database": {
        type: string;
        name: string;
        user: string;
        password: string;
        host: string;
        port: number;
      };
      "control-socket": {
        "socket-type": string;
        "socket-name": string;
      };
      "expired-leases-processing": {
        "reclaim-timer-wait-time": number;
        "flush-reclaimed-timer-wait-time": number;
        "hold-reclaimed-time": number;
        "max-reclaim-leases": number;
        "max-reclaim-time": number;
        "unwarned-reclaim-cycles": number;
      };
      "renew-timer": number;
      "rebind-timer": number;
      "valid-lifetime": number;
      subnet4: Array<{
        id: number;
        subnet: string;
        pools: Array<{
          pool: string;
        }>;
        "option-data": Array<{
          name: string;
          data: string;
        }>;
      }>;
    };
  };

// pod item type
export type PodItem = {
    metadata: {
      creationTimestamp: string;
      name: string;
      labels: {
        app: string;
      };
    };
    status: {
      phase: string;
      podIP: string;
      startTime: string;
      containerStatuses: Array<{
        name: string
        restartCount: string
      }>
    };
    spec: {
      nodeName: string
    }
  }
  

// subnet type
export type Subnet = {
  id: number;
  subnet: string;
  pools: Array<{
    pool: string;
  }>;
  "option-data": Array<{
    name: string;
    data: string;
  }>;
  status: string;
};
