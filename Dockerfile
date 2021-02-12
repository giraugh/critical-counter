FROM haskell:8.8.4

WORKDIR /app
ADD . /app

# RUN stack setup
RUN stack build --copy-bins

EXPOSE 80

CMD ["critical-counter-exe"]
