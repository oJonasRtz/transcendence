#!/bin/bash

set -e

OUTPUT="server.ip"
IP=$(hostname -I | awk '{print $1}')
echo "$IP" > 'shared/ip/'"$OUTPUT"