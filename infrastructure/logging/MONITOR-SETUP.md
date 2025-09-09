<!-- # Commands to run after starting the stack:

docker exec elasticsearch bin/elasticsearch-create-enrollment-token -s kibana


## copy and paste token on localhost:5601

docker exec kibana bin/kibana-verification-code


## copy and paste code

docker exec -it elasticsearch bin/elasticsearch-reset-password -u elastic --interactive

## set new password, confirm new password, and login -->

# Run all docker but Kibana

docker compose up -d --build elasticsearch logstash backend 

# Create system login

docker compose exec elasticsearch bin/elasticsearch-users useradd kibanasser -p search -r kibana_system

# Run Kibana docker

docker compose up -d --build kibana 

# Create the custom role with the correct privileges

curl -u elastic:search -X PUT "localhost:9200/_security/role/kibana_data_reader" -H "Content-Type: application/json" -d '{
  "indices": [
    {
      "names": [ "fastify-logs-*" ],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}'

# Create or update admin login with correct roles (Kibana UI + data access):

curl -u elastic:search -X PUT "localhost:9200/_security/user/nasserdmin" -H "Content-Type: application/json" -d '{
  "roles": ["kibana_admin", "kibana_data_reader"],
  "password": "nassword"
}'


# Login with admin login on localhost:5601

nasserdmin
nassword

on 'Discover' tab: input the index pattern (fastify-logs-*)

# To run K6 script:

docker compose up -d --build k6

docker compose exec k6 k6 run /k6-script.js

<!-- # Commands to install K6
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

## to run the k6 scrypt:

k6 run k6-script.js -->