#!/bin/bash

echo "CreditBoost Application Runner"
echo "============================="
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Java is not installed. Please install Java first with:"
    echo "sudo apt install default-jre -y"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Maven is not installed. Please install Maven first with:"
    echo "sudo apt install maven -y"
    exit 1
fi

# Navigate to the correct directory (handling spaces in directory names)
cd "Backend SpringBoot" || {
    echo "Failed to navigate to the Spring Boot directory"
    exit 1
}

echo "Building the application..."
mvn clean install

echo ""
echo "Running the application..."
cd user-service || {
    echo "Failed to navigate to the user-service directory"
    exit 1
}
mvn spring-boot:run