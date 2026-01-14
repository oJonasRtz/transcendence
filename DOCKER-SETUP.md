# Create .env files:

.env.dev
  SSL=false
  password=search

.env.prod

# Suggestion for dev/prod commands:

alias dcdev='docker compose --env-file .env.dev'
alias dcprod='docker compose --env-file .env.prod'

# Create logs file if not created yet:

touch ./infrastructure/logging/logs/app.log

# Run all dockers but Kibana

docker compose up -d --build elasticsearch logstash backend  k6

# Create system login

docker compose exec elasticsearch bin/elasticsearch-users useradd kibanasser -p search -r kibana_system

# Run Kibana docker

docker compose up -d --build kibana 

# Create the custom role with the correct privileges

curl -k -u elastic:search -X PUT "localhost:9200/_security/role/kibana_data_reader" -H "Content-Type: application/json" -d '{
  "indices": [
    {
      "names": [ "fastify-logs-*" ],
      "privileges": ["read", "view_index_metadata"]
    }
  ]
}'

# Create or update admin login with correct roles (Kibana UI + data access):

curl -k -u elastic:search -X PUT "localhost:9200/_security/user/nasserdmin" -H "Content-Type: application/json" -d '{
  "roles": ["kibana_admin", "kibana_data_reader"],
  "password": "nassword"
}'


# Login with admin login on localhost:5601

nasserdmin
nassword

on 'Discover' tab: input the index pattern (fastify-logs-*)

# RUN THIS COMMAND FOR DB BEFORE TESTING API

docker exec -it backend-fastify node src/database/migrations.js

# To run K6 script:

docker compose up -d --build k6

docker compose exec k6 k6 run /k6-script.js
