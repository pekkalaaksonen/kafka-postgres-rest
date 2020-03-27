FROM node:10-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENV PORT=3000
CMD node index.js
EXPOSE 3000