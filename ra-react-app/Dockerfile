FROM node:18-alpine
WORKDIR /app/frontend
ENV PATH /app/frontend/node_modules/.bin:$PATH
COPY package.json package-lock.json ./
RUN npm ci
RUN npm install react-scripts@5.0.0 -g 
COPY . .
EXPOSE 3000