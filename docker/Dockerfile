FROM node:24

# install the blueprint
RUN npm install -g generator-jhipster-nodejs

# use the non-root "node" user and the documented working directory
RUN mkdir -p /home/jhipster/app && chown node:node /home/jhipster/app
USER node
WORKDIR /home/jhipster/app
VOLUME ["/home/jhipster/app"]

CMD ["nhipster"]
