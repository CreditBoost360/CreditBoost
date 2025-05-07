#!/bin/bash
# Check if Java 17 is installed
if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
  export PATH=$JAVA_HOME/bin:$PATH
  echo "Switched to Java 17"
  java -version
else
  echo "Java 17 not found. Please install it with: sudo apt install openjdk-17-jdk"
fi
