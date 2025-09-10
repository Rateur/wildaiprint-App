# Use the official Nginx image to serve static files
FROM nginx:alpine

# Remove the default Nginx HTML content
RUN rm -rf /usr/share/nginx/html/*

# Copy your frontend files into Nginx's public directory
COPY . /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Nginx will start automatically when the container runs