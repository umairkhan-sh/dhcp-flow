#!/bin/bash

# Variables to Set Before

API_SERVER=https://10.1.42.70:6443
TOKEN=eyJhbGciOiJSUzI1NiIsImtpZCI6IkllazFzZGFGb2NZeVItbkF5WEs2dVlUd3kzaXFYdExkVHVOS2JMVW5LWHcifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImV4dGVybmFsLWFwaS12aWV3ZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZXh0ZXJuYWwtYXBpLXZpZXdlciIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImE1MTlkNTJkLTc4NmItNGFjNi1iYWQyLWNkNTU4NWJlOWU3NyIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmV4dGVybmFsLWFwaS12aWV3ZXIifQ.oQVCI2ZyYGYKpSa0hpSTbBCZUKzzRrUIG4LihRO_2VZYA0nM_608UdBGUkVNJt4KbM0LyKe7oHHt1GJPqBObKJspE3yPwdsm1D1l2sCgOKtDB8QtDldO5e30Yez7MKDSNxFPSWD8YMO4kiK7t73YrvMTp_hSwwrsOPC-0h0X8ZRGJSWo0FFupiBhsuHUnIhEtamGiS4kRoMJvx_qs3tU6aJdNVaK390yvNpkhqJuekkN82k7zRKXUNZqUTt3swARRZPFmRr6Gc2FLpHZv0cLbLUjt-6sXlAU5ZD-U1FQ1kVpOn-4rQmHS8WUKM-Tf4xIzE4v8cJrojU-EIlZSB04Kw
NAMESPACE="default"
CONFIGMAP_NAME="kea-config"
CONFIGMAP_KEY="kea-dhcp4.conf"
CACHE_DIR="/tmp/kea-cache"
ARCHIVE_DIR="$CACHE_DIR/archive"
NEW_CONFIG="/tmp/after_updated_config"
PATCH_DIR="/tmp/patch"
UPDATED_CONF="/tmp/updated_config"
GENERATED_CONF="/tmp/kea-cache/generated"
LABEL_SELECTOR="app=kea-dhcp4"

mkdir -p "$CACHE_DIR"
mkdir -p "$ARCHIVE_DIR"
mkdir -p "$GENERATED_CONF"
mkdir -p "$NEW_CONFIG"

# 0. Create Configuration Files from scratch
generate_scratch_config() {
    config_file="/tmp/kea-cache/generated/kea-dhcp4_$(date +%Y%m%d%H%M%S).conf"
    
    echo "Creating a new ConfigMap locally..."

    # Initial structure for Dhcp4 settings
    cat <<EOL > $config_file
{
  "Dhcp4": {
    "allocator": "random",
    "interfaces-config": {
      "interfaces": [ "*" ],
      "dhcp-socket-type": "udp"
    },
    "multi-threading": {
      "enable-multi-threading": true,
      "thread-pool-size": 12,
      "packet-queue-size": 100
    },
    "hooks-libraries": [
      {
        "library": "/usr/lib/kea/hooks/libdhcp_lease_cmds.so"
      },
      {
        "library": "/usr/lib/kea/hooks/libdhcp_stat_cmds.so"
      },
      {
        "library": "/usr/lib/kea/hooks/libdhcp_mysql_cb.so"
      }
    ],
    "loggers": [
      {
        "name": "kea-dhcp4",
        "output_options": [
          {
            "output": "/var/log/kea/kea-dhcp4.log",
            "maxver": 8
          },
          {
            "output": "stdout"
          }
        ],
        "severity": "INFO"
      }
    ],
    "lease-database": {
      "type": "mysql",
      "name": "dhcp",
      "user": "root",
      "password": "Inara@123",
      "host": "haproxy-svc.default",
      "port": 3306
    },
    "control-socket": {
      "socket-type": "unix",
      "socket-name": "/run/kea/control_socket_4"
    },
    "expired-leases-processing": {
      "reclaim-timer-wait-time": 10,
      "flush-reclaimed-timer-wait-time": 25,
      "hold-reclaimed-time": 120,
      "max-reclaim-leases": 50,
      "max-reclaim-time": 60,
      "unwarned-reclaim-cycles": 5
    },
    "renew-timer": 260,
    "rebind-timer": 280,
    "valid-lifetime": 300,
    "subnet4": [
EOL

    # Loop for adding subnets
    subnet_id=1
    subnets_added=false
    while true; do
        echo "Do you want to add a new subnet? (y/n): "
        read add_subnet
        if [[ "$add_subnet" == "y" ]]; then
            subnets_added=true
            echo "Enter the subnet CIDR (e.g., 11.0.0.0/9): "
            read subnet_cidr
            echo "Enter the start IP of the pool (e.g., 11.0.0.2): "
            read pool_start
            echo "Enter the end IP of the pool (e.g., 11.127.255.254): "
            read pool_end
            echo "Enter the router IP (e.g., 11.0.0.1): "
            read router_ip
            echo "Enter the DNS servers (comma-separated, e.g., 10.1.6.2,10.254.153.200): "
            read dns_servers

            # Append the new subnet configuration
            cat <<EOL >> $config_file
      {
        "id": $subnet_id,
        "subnet": "$subnet_cidr",
        "pools": [
          { "pool": "$pool_start - $pool_end" }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "$router_ip"
          },
          {
            "name": "domain-name-servers",
            "data": "$dns_servers"
          }
        ]
      },
EOL

            ((subnet_id++)) # Increment subnet ID for the next subnet
        elif [[ "$add_subnet" == "n" ]]; then
            break
        else
            echo "Invalid input. Please type 'y' or 'n'."
        fi
    done

    if [[ "$subnets_added" == false ]]; then
        echo "No subnets added. Aborting configuration creation."
        rm -f $config_file
        return 1
    fi

    # Remove the last comma if no more subnets are added
    sed -i '$ s/,$//' $config_file

    # Close the JSON structure
    cat <<EOL >> $config_file
    ]
  }
}
EOL
    echo "" >> $config_file
    echo "ConfigMap configuration saved to: $config_file."
}


# 1. Create Agent Files
generate_agentconf() {
    agentconf=$(cat <<EOF
{
    "Control-agent": {
        "http-host": "0.0.0.0",
        "http-port": 8000,
        "control-sockets": {
            "dhcp4": {
                "socket-type": "unix",
                "socket-name": "/run/kea/control_socket_4"
            },
            "dhcp6": {
                "socket-type": "unix",
                "socket-name": "/run/kea/control_socket_6"
            },
            "d2": {
                "socket-type": "unix",
                "socket-name": "/run/kea/control_socket_d2"
            }
        },
        "loggers": [
            {
                "name": "kea-ctrl-agent",
                "output_options": [
                    {
                        "output": "/var/log/kea/kea-ctrl-agent.log",
                        "maxver": 8
                    }
                ],
                "severity": "INFO"
            }
        ]
    }
}
EOF
    )
    echo "$agentconf"
}

# 2. Push new Files to Kubernetes
push_new_configmap() {
    echo "Checking the latest updated configuration..."

    LATEST_GENERATED_CONFIG=$(ls -t "$GENERATED_CONF"/*.conf 2>/dev/null | head -n 1)
    if [ -z "$LATEST_GENERATED_CONFIG" ]; then
        echo "No generated configuration found. Aborting operation."
        return 1
    fi

    GEN_CONF=$(cat "$LATEST_GENERATED_CONFIG")
    # echo "$GEN_CONF"
    
    # Generate agent configuration and save it in a variable
    X_CONF=$(generate_agentconf)
    AGENT_CONF=$(echo "$X_CONF" | jq)
    AGENT_KEY="kea-ctrl-agent.conf"

    # Fetch the current ConfigMap from Kubernetes
    CURRENT_CONFIG=$(curl -sS -H "Authorization: Bearer $TOKEN" --cacert ca.crt \
        "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME" | jq -r '.data["kea-dhcp4.conf"]')
    CURRENT_CONFIG_KEY1=$(curl -sS -H "Authorization: Bearer $TOKEN" --cacert ca.crt \
        "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME" | jq -r '.data["kea-dhcp4.conf"]')
    CURRENT_CONFIG_KEY2=$(curl -sS -H "Authorization: Bearer $TOKEN" --cacert ca.crt \
        "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME" | jq -r '.data["kea-ctrl-agent.conf"]')

    if { [ "$CURRENT_CONFIG_KEY1" = "null" ] || [ -z "$CURRENT_CONFIG_KEY1" ]; } && \
       { [ "$CURRENT_CONFIG_KEY2" = "null" ] || [ -z "$CURRENT_CONFIG_KEY2" ]; }; then
        echo "ConfigMap '$CONFIGMAP_NAME' does not exist or contains no valid data."

        # Prompt the user to create a new ConfigMap
        read -p "Do you want to create a new ConfigMap with the latest configuration? (yes/no): " user_input
        if [[ "$user_input" =~ ^[Yy]([Ee][Ss])?$ ]]; then
            echo "Creating new ConfigMap in Kubernetes..."
            CREATE_PAYLOAD=$(jq -n \
                --arg key1 "$CONFIGMAP_KEY" \
                --arg content1 "$(cat "$LATEST_GENERATED_CONFIG")" \
                --arg key2 "$AGENT_KEY" \
                --arg content2 "$AGENT_CONF" '{
                    "apiVersion": "v1",
                    "kind": "ConfigMap",
                    "metadata": {
                        "name": "'"$CONFIGMAP_NAME"'",
                        "namespace": "'"$NAMESPACE"'"
                    },
                    "data": {
                        ($key1): $content1,
                        ($key2): $content2
                    }
                }')

            RESPONSE=$(curl -sS -X POST \
                -H "Authorization: Bearer $TOKEN" \
                --cacert ca.crt \
                -H "Content-Type: application/json" \
                -d "$CREATE_PAYLOAD" \
                "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps")

            if echo "$RESPONSE" | jq -e '.metadata.name' >/dev/null 2>&1; then
                echo "New ConfigMap created successfully."
            else
                echo "Failed to create ConfigMap. Response: $RESPONSE"
                return 1
            fi
        else
            echo "Aborting operation."
            return 1
        fi
    else
        echo "Comparing the current ConfigMap with the updated configuration..."
        if diff --ignore-blank-lines -q <(echo "$CURRENT_CONFIG") "$LATEST_GENERATED_CONFIG" >/dev/null 2>&1; then
            echo "The current ConfigMap matches the updated configuration. No changes required."
        else
            echo "Differences detected. Updating ConfigMap..."
            diff -u <(echo "$CURRENT_CONFIG") "$LATEST_GENERATED_CONFIG"

            PATCH_PAYLOAD=$(jq -n \
                --arg key1 "$CONFIGMAP_KEY" \
                --arg content1 "$(cat "$LATEST_GENERATED_CONFIG")" \
                --arg key2 "$AGENT_KEY" \
                --arg content2 "$AGENT_CONF" '{
                    "data": {
                        ($key1): $content1,
                        ($key2): $content2
                    }
                }')

            RESPONSE=$(curl -sS -X PATCH \
                -H "Authorization: Bearer $TOKEN" \
                --cacert ca.crt \
                -H "Content-Type: application/merge-patch+json" \
                -d "$PATCH_PAYLOAD" \
                "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME")

            if echo "$RESPONSE" | jq -e '.metadata.name' >/dev/null 2>&1; then
                echo "ConfigMap updated successfully."
            else
                echo "Failed to update ConfigMap. Response: $RESPONSE"
                return 1
            fi
        fi
    fi
}

# 3. Fetch existing ConfigMap
fetch_configmap() {
    echo "Fetching existing ConfigMap..."
    CONFIGMAP_DATA=$(curl -sS -H "Authorization: Bearer $TOKEN" --cacert ca.crt "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME" | jq -r '.data["kea-dhcp4.conf"]  ')

    if [ "$CONFIGMAP_DATA" = "null" ] || [ -z "$CONFIGMAP_DATA" ]; then
        echo "ConfigMap '$CONFIGMAP_NAME' does not exist or contains no valid data."
        exit 1
    fi
    # Save valid data to the cache file

    echo "$CONFIGMAP_DATA" > "$CACHE_DIR/$CONFIGMAP_KEY"
    echo "ConfigMap fetched and saved to cache at '$CACHE_DIR/$CONFIGMAP_KEY'."
}

# 4. Save existing config in cache and archive
archive_config() {
    local timestamp
    timestamp=$(date +%Y-%m-%d-%H:%M:%S)
    echo "Archiving current configuration..."
    cp "$CACHE_DIR/$CONFIGMAP_KEY" "$ARCHIVE_DIR/$CONFIGMAP_KEY-$timestamp"
    echo "Configuration archived as $ARCHIVE_DIR/$CONFIGMAP_KEY-$timestamp"
}

# 5. View Commit Changes before commit
show_commit_changes() {
    mkdir -p "$CACHE_DIR" "$PATCH_DIR" "$UPDATED_CONF"

    if ! diff -q "$CACHE_DIR/$CONFIGMAP_KEY" "$UPDATED_CONF/$CONFIGMAP_KEY" >/dev/null 2>&1; then
        echo "Changes to Commit..."
        diff -u "$CACHE_DIR/$CONFIGMAP_KEY" "$UPDATED_CONF/$CONFIGMAP_KEY" 
    else
        echo "No changes to Commit."
    fi   
}

# 6. Compare and update configuration
update_config() {
    # Ensure required directories exist
    mkdir -p "$CACHE_DIR" "$PATCH_DIR" "$UPDATED_CONF"

    echo "Checking for configuration differences..."
    if ! diff -q "$CACHE_DIR/$CONFIGMAP_KEY" "$UPDATED_CONF/$CONFIGMAP_KEY" >/dev/null 2>&1; then
        echo "Differences detected. Creating a patch."
        diff -u "$CACHE_DIR/$CONFIGMAP_KEY" "$UPDATED_CONF/$CONFIGMAP_KEY" 
        PATCH_KEY="${PATCH_KEY:-patch}"  # Default name for patch if not provided
        PATCH_FILE="$PATCH_DIR/${PATCH_KEY}_$(date +%Y%m%d%H%M%S).patch"
        diff -u "$CACHE_DIR/$CONFIGMAP_KEY" "$UPDATED_CONF/$CONFIGMAP_KEY" > "$PATCH_FILE"

        echo "Applying the patch to the cached file..."
        if patch "$CACHE_DIR/$CONFIGMAP_KEY" "$PATCH_FILE"; then
            echo "Patch applied successfully."

            echo "Copying updated configuration to the after_updated_config directory..."
            cp "$CACHE_DIR/$CONFIGMAP_KEY" "$NEW_CONFIG/${CONFIGMAP_KEY}_$(date +%Y%m%d%H%M%S).conf"

            echo "Configuration updated and saved."
        else
            echo "Failed to apply patch. Aborting update."
            return 1
        fi
    else
        echo "No differences detected. Skipping update."
    fi
}

# 7. Rollback and update configuration to last available
rollback_config() {

    # Find the latest patch file
    LAST_PATCH=$(ls -t "$PATCH_DIR"/*.patch 2>/dev/null | head -n 1)
    if [ -z "$LAST_PATCH" ]; then
        echo "No patch files found. Rollback cannot proceed."
        return 1
    fi

    echo "Rolling back using patch file: $LAST_PATCH"
    if patch -R "$CACHE_DIR/$CONFIGMAP_KEY" "$LAST_PATCH"; then

        diff -u "$NEW_CONFIG" "$CACHE_DIR/$CONFIGMAP_KEY"  
        echo "Rollback applied successfully."

        # Copy the rolled-back configuration to the updated config directory for tracking
        cp "$CACHE_DIR/$CONFIGMAP_KEY" "$UPDATED_CONF/${CONFIGMAP_KEY}_rolledback_$(date +%Y%m%d%H%M%S)"
        echo "Rolled-back configuration saved to updated config directory."
    else
        echo "Failed to apply rollback. Configuration remains unchanged."
        return 1
    fi
}

# 8. View Rollback changes before rollback
show_lastrollback_changes() {
    # Find the last updated config file
    LAST_UPDATED_CONFIG=$(ls -t "$UPDATED_CONF"/*.conf* 2>/dev/null | head -n 1)
    if [ -z "$LAST_UPDATED_CONFIG" ]; then
        echo "No updated config files found. Nothing to compare."
        return 1
    fi

    echo "Latest updated config file: $LAST_UPDATED_CONFIG"

    # Find the last archive file
    LAST_ARCHIVE=$(ls -t "$ARCHIVE_DIR"/*.conf* 2>/dev/null | head -n 1)
    if [ -z "$LAST_ARCHIVE" ]; then
        echo "No archive files found. Nothing to compare."
        return 1
    fi

    echo "Latest archive file: $LAST_ARCHIVE"

    # Compare the differences between the last updated config and the last archive
    echo "Comparing differences between the latest updated config and previous configuration:"
    DIFF=$(diff -u "$LAST_UPDATED_CONFIG" "$LAST_ARCHIVE")
    
    if [ $? -eq 0 ]; then
        echo "No differences found. Nothing to rollback."
        return 0
    else
        echo -e "\033[0;31m$DIFF\033[0m"
        echo "Differences detected. Ready for rollback."
        return 1
    fi
}

# 9. Push Configuration to Kubernetes
push_configmap() {
    echo "Pushing updated ConfigMap to Kubernetes"

    # Find the most recent updated configuration file
    LAST_UPDATED_CONFIG=$(ls -t "$UPDATED_CONF"/*.conf* 2>/dev/null | head -n 1)
    if [ -z "$LAST_UPDATED_CONFIG" ]; then
        echo "No updated configuration found. Aborting push."
        return 1
    fi

    echo "Using the latest updated configuration: $LAST_UPDATED_CONFIG"

    # Fetch the current ConfigMap
    CURRENT_CONFIG=$(curl -sS -H "Authorization: Bearer $TOKEN" --cacert ca.crt \
        "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME" | jq -r '.data["kea-dhcp4.conf"]')

    if [ "$CURRENT_CONFIG" = "null" ] || [ -z "$CURRENT_CONFIG" ]; then
        echo "ConfigMap '$CONFIGMAP_NAME' does not exist or contains no valid data. Aborting push."
        return 1
    fi

    # Save the fetched ConfigMap content to a temporary file for comparison
    CURRENT_CONFIG_TMP=$(mktemp)
    echo "$CURRENT_CONFIG" > "$CURRENT_CONFIG_TMP"

    # Compare fetched configuration with the latest updated configuration
    if diff -q "$CURRENT_CONFIG_TMP" "$LAST_UPDATED_CONFIG" >/dev/null 2>&1; then
        echo "No differences detected between the current ConfigMap and the updated configuration. Skipping push."
        rm -f "$CURRENT_CONFIG_TMP"
        return 0
    fi
    rm -f "$CURRENT_CONFIG_TMP"

    # Patch the current ConfigMap with the latest updated config
    echo "Differences detected. Patching existing ConfigMap..."
    PATCH_PAYLOAD=$(jq -n --arg key "$CONFIGMAP_KEY" --arg content "$(cat "$LAST_UPDATED_CONFIG")" '{
        "data": {
            ($key): $content
        }
    }')

    RESPONSE=$(curl -sS -X PATCH \
        -H "Authorization: Bearer $TOKEN" \
        --cacert ca.crt \
        -H "Content-Type: application/merge-patch+json" \
        -d "$PATCH_PAYLOAD" \
        "$API_SERVER/api/v1/namespaces/$NAMESPACE/configmaps/$CONFIGMAP_NAME")

    # Check response for success or failure
    if echo "$RESPONSE" | jq -e '.status' | grep -q "Failure"; then
        echo "Failed to update ConfigMap. Response: $RESPONSE"
        return 1
    else
        echo "ConfigMap updated successfully."
    fi
}

update_pods() {
    # Step 1: Get all pods matching the label selector
    PODS=$(kubectl get pods -n "$NAMESPACE" -l "$LABEL_SELECTOR" -o jsonpath='{.items[*].metadata.name}')

    # The command to fetch the configuration
    

    COMMAND="/fetch_cm.sh"

    # Step 2: Execute the command on each pod
    for POD in $PODS; do
        echo "Executing configuration fetch command on pod: $POD"
        
        # Execute the command inside the pod
        kubectl exec -n "$NAMESPACE" "$POD" -- bash "$COMMAND"
        
        echo "Finished executing on pod: $POD"
    done
}

rollout_deployment() {
    # Step 1: Get all pods matching the label selector
    PODS=$(kubectl get pods -n "$NAMESPACE" -l "$LABEL_SELECTOR" -o jsonpath='{.items[*].metadata.name}')
    COMMAND="/config_reload.sh"

    # Step 2: Execute the command on each pod
    for POD in $PODS; do
        echo "Executing configuration fetch command on pod: $POD"
        kubectl exec -n "$NAMESPACE" "$POD" -- bash "$COMMAND"  
        echo "Finished executing on pod: $POD"
    done
}

add_subnets_to_existing() {
    local config_file="/tmp/kea-cache/kea-dhcp4.conf"  # Replace with the actual path
    local output_file="/tmp/updated_config/kea-dhcp4.conf" # Path to save the updated configuration

    # Backup the original configuration file
    mkdir -p "$(dirname "$output_file")"
    cp "$config_file" "$output_file"

    while true; do
        # Extract the highest subnet ID from the updated file
        highest_id=$(jq '.Dhcp4.subnet4 | max_by(.id) | .id' "$output_file")
        if [[ -z $highest_id || $highest_id == "null" ]]; then
            echo "Failed to determine the highest subnet ID."
            return 1
        fi

        # Increment the highest ID
        new_id=$((highest_id + 1))

        echo "Enter the subnet CIDR (e.g., 10.1.1.0/24):"
        read -r subnet_cidr

        echo "Enter the start IP of the pool (e.g., 10.1.1.10):"
        read -r pool_start

        echo "Enter the end IP of the pool (e.g., 10.1.1.20):"
        read -r pool_end

        echo "Enter the router IP (e.g., 10.1.1.1):"
        read -r router_ip

        echo "Enter the DNS servers (comma-separated, e.g., 8.8.8.8,8.8.4.4):"
        read -r dns_servers

        # Create the new subnet object
        new_subnet=$(jq -n --argjson id "$new_id" \
            --arg subnet "$subnet_cidr" \
            --arg pool "$pool_start - $pool_end" \
            --arg router "$router_ip" \
            --arg dns "$dns_servers" \
            '{
                id: $id,
                subnet: $subnet,
                pools: [{ pool: $pool }],
                "option-data": [
                    { name: "routers", data: $router },
                    { name: "domain-name-servers", data: $dns }
                ]
            }')

        # Add the new subnet to the configuration
        updated_config=$(jq ".Dhcp4.subnet4 += [$new_subnet]" "$output_file")

        if [[ $? -ne 0 ]]; then
            echo "Failed to add the new subnet to the configuration."
            return 1
        fi

        # Save the updated configuration
        echo "$updated_config" > "$output_file"
        if [[ $? -eq 0 ]]; then
            echo "Subnet added successfully. Updated configuration saved to $output_file"
        else
            echo "Failed to save the updated configuration."
            return 1
        fi

        # Prompt the user if they want to add another subnet
        echo "Do you want to add another subnet? (y/n):"
        read -r response
        if [[ "$response" != "y" ]]; then
            echo "Exiting subnet addition."
            break
        fi
    done
}

show_added_subnets() {
    local config_file="/tmp/updated_config/kea-dhcp4.conf"  # Path to the updated configuration

    # Check if the file exists
    if [[ ! -f "$config_file" ]]; then
        echo "Configuration file not found: $config_file"
        return 1
    fi

    # Prompt user for viewing subnets
    echo "Do you want to view the added subnets? (y/n):"
    read -r response
    if [[ "$response" != "y" ]]; then
        echo "Exiting subnet view."
        return
    fi

    # Use jq to display the subnets from the configuration
    jq '.Dhcp4.subnet4' "$config_file"
}




# fetch_configmap
# archive_config
# update_config
# rollback_config
# show_commit_changes
# show_lastrollback_changes
# push_configmap
# generate_config
# generate_agentconf
# push_new_configmap
# update_pods
# rollout_deployment
# add_subnets_to_existing
show_added_subnets
