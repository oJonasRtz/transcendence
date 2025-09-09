# Informativo de Comandos Docker

## docker compose exec vs docker exec
- `docker compose exec`: Executa comandos em containers gerenciados pelo Docker Compose, usando o nome do serviço definido no docker-compose.yml. Exemplo: docker compose exec backend bash
- `docker exec`: Executa comandos em qualquer container pelo nome ou ID do container. Exemplo: docker exec -it backend-fastify bash

## Flags comuns
- `-it`: Abre terminal interativo (bash/sh).
- `-d`: Roda container em background (detached).
- `--build`: Força rebuild da imagem antes de subir o container.
- `-v`: No comando down, remove volumes nomeados (não afeta bind mounts).
- `--no-cache`: No build, força ignorar cache de camadas.

## docker compose down
- Para containers e remove redes, mas mantém volumes e arquivos bind mount.
- Com `-v`, remove volumes nomeados (dados persistentes em volumes são apagados).

## docker compose up --build
- Sobe os serviços e força rebuild das imagens antes de iniciar.
- Rodar `build` antes de `up` tem efeito similar, mas `--build` é mais prático.

## docker compose restart
- Reinicia os containers sem remover volumes ou redes.
- Não é igual a down + up: restart mantém o estado dos volumes e redes, down remove redes e pode remover volumes com -v.

## Comandos que aceitam múltiplos containers/serviços como argumento
Alguns comandos do Docker Compose permitem especificar mais de um serviço/container na mesma linha, facilitando operações em lote.

Exemplos:
- `docker compose up -d backend elasticsearch logstash` (sobe vários serviços juntos)
- `docker compose down backend logstash` (derruba apenas os serviços especificados)
- `docker compose restart backend kibana` (reinicia múltiplos serviços)
- `docker compose logs backend logstash` (mostra logs de vários serviços)
- `docker compose build backend k6` (rebuilda imagens de vários serviços)

## Outros comandos úteis
- `docker compose ps`: Lista containers gerenciados pelo Compose.
- `docker compose logs backend`: Mostra logs do serviço backend.
- `docker compose build --no-cache backend`: Rebuilda imagem ignorando cache.
- `docker compose exec backend bash`: Abre terminal no serviço backend.
- `docker exec -it backend-fastify bash`: Abre terminal no container backend-fastify.
- `docker compose up -d backend`: Sobe apenas o serviço backend em background.
- `docker compose down backend`: Para e remove apenas o serviço backend.

## Observações
- Bind mounts (ex: volumes mapeando arquivos do host) não são removidos com down -v.
- Sempre rode migrations após recriar o banco para garantir que as tabelas existem.
- Para checar arquivos dentro do container, use exec + bash/sh e navegue até o caminho desejado.

---
