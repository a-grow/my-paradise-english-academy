FROM alpine:latest
WORKDIR /app
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip pb.zip
RUN apk add unzip && unzip pb.zip && rm pb.zip
EXPOSE 8090
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
