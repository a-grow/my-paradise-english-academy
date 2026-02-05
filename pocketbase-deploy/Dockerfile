FROM alpine:latest
WORKDIR /pb

# Download PocketBase release (adjust version if needed)
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.4/pocketbase_0.22.4_linux_amd64.zip pb.zip

# Unzip and clean up
RUN apk add --no-cache unzip && unzip pb.zip && rm pb.zip

# Expose Render's default port
EXPOSE 10000

# Start PocketBase on the correct port
CMD ["./pocketbase", "serve", "--http=0.0.0.0:10000"]
