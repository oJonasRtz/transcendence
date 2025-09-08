# Commands to run after starting the stack:
docker exec elasticsearch bin/elasticsearch-create-enrollment-token -s kibana
## copy and paste token on localhost:5601
docker exec kibana bin/kibana-verification-code
## copy and paste code
docker exec -it elasticsearch bin/elasticsearch-reset-password -u elastic --interactive
## set new password, confirm new password, and login
on 'Discover' tab: input the index pattern (fastify-logs-*)

# Commands to install K6
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

## to run the k6 scrypt:

k6 run k6-script.js