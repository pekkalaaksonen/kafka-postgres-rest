FROM node:10-alpine
WORKDIR /app
COPY package.json /app
RUN apk add --no-cache make gcc g++ python && npm install && apk del make gcc g++ python
COPY . /app
COPY start_consumer.sh /start_consumer.sh
RUN chmod +x /start_consumer.sh
ENTRYPOINT ["/start_consumer.sh"]