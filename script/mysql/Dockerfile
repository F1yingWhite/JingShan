FROM mysql:latest
ENV MYSQL_DATABASE=jingshan
ADD backup.sql /docker-entrypoint-initdb.d/
EXPOSE 3306