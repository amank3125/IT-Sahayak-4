#!/bin/bash

echo "Checking network connection..."
ping -c 3 8.8.8.8

if [ $? -eq 0 ]; then
    echo "Network connection is working"
    exit 0
else
    echo "Network connection is not working"
    exit 1
fi 