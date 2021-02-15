FROM fpco/stack-build:lts-16.12

RUN curl -L https://github.com/fpco/stack-docker-image-build/releases/download/v0.1.0.0/stack-docker-image-build > /usr/local/bin/stack-docker-image-build && chmod +x /usr/local/bin/stack-docker-image-build

ADD ./ /src

RUN cd /src && /usr/local/bin/stack-docker-image-build

EXPOSE 8080 
CMD ["critical-counter-exe"]
