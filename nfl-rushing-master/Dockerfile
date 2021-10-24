FROM node

WORKDIR /app

RUN mkdir /frontend/
ADD frontend/ /frontend

COPY ["rushing.json", "./"]
COPY ["server.js", "./"]

RUN npm install express
RUN npm install mysql

CMD ["node", "server.js"]