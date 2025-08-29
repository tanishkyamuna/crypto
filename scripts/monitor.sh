#!/bin/bash

# Simple monitoring script for CryptoQuiver
# Add this to crontab to run every 5 minutes: */5 * * * * /path/to/monitor.sh

APP_URL="http://localhost:3000"
LOG_FILE="~/cryptoquiver/logs/monitor.log"
WEBHOOK_URL=""  # Add your Discord/Slack webhook URL here

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Function to send alert
send_alert() {
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 CryptoQuiver Alert: $1\"}" \
            $WEBHOOK_URL
    fi
}

# Check if application is responding
check_app() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL/api/health)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
        log_message "Application health check: OK"
        return 0
    else
        echo -e "${RED}❌ Application is down (HTTP $response)${NC}"
        log_message "Application health check: FAILED (HTTP $response)"
        send_alert "Application is down (HTTP $response)"
        return 1
    fi
}

# Check Docker containers
check_containers() {
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Docker containers are running${NC}"
        log_message "Docker containers: OK"
        return 0
    else
        echo -e "${RED}❌ Some Docker containers are down${NC}"
        log_message "Docker containers: FAILED"
        send_alert "Some Docker containers are down"
        return 1
    fi
}

# Check disk space
check_disk() {
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 90 ]; then
        echo -e "${GREEN}✅ Disk usage is normal ($disk_usage%)${NC}"
        log_message "Disk usage: $disk_usage%"
        return 0
    else
        echo -e "${RED}❌ Disk usage is high ($disk_usage%)${NC}"
        log_message "Disk usage: HIGH ($disk_usage%)"
        send_alert "Disk usage is high ($disk_usage%)"
        return 1
    fi
}

# Check memory usage
check_memory() {
    memory_usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    
    if [ "$memory_usage" -lt 90 ]; then
        echo -e "${GREEN}✅ Memory usage is normal ($memory_usage%)${NC}"
        log_message "Memory usage: $memory_usage%"
        return 0
    else
        echo -e "${RED}❌ Memory usage is high ($memory_usage%)${NC}"
        log_message "Memory usage: HIGH ($memory_usage%)"
        send_alert "Memory usage is high ($memory_usage%)"
        return 1
    fi
}

# Main monitoring function
main() {
    echo "🔍 Starting CryptoQuiver monitoring check..."
    log_message "Starting monitoring check"
    
    # Run all checks
    check_app
    app_status=$?
    
    check_containers
    container_status=$?
    
    check_disk
    disk_status=$?
    
    check_memory
    memory_status=$?
    
    # Overall status
    if [ $app_status -eq 0 ] && [ $container_status -eq 0 ] && [ $disk_status -eq 0 ] && [ $memory_status -eq 0 ]; then
        echo -e "${GREEN}🎉 All systems operational${NC}"
        log_message "All systems operational"
    else
        echo -e "${RED}⚠️  Some issues detected${NC}"
        log_message "Issues detected during monitoring"
    fi
    
    log_message "Monitoring check completed"
}

# Run the monitoring
main
