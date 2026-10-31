# pg_dump of the same major as the server, age to encrypt and rclone to upload to R2.
FROM postgres:18.6
RUN apt-get update \
    && apt-get install -y --no-install-recommends age rclone ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY backup.sh restore.sh /usr/local/bin/
ENTRYPOINT ["backup.sh"]
