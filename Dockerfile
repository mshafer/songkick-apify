FROM apify/actor-node-basic

# Copy all files and directories from the directory to the Docker image
COPY . ./

# Install NPM packages, skip optional dependencies to keep the image small
# We need to install development dependencies so we can transpile with babel,
# but after that we prune the dependency tree.
ENV NODE_ENV=development
RUN npm install --quiet --no-optional
RUN npm run build
RUN npm prune --production
ENV NODE_ENV=production

# Define the start command
ENTRYPOINT [ "node", "dist/start_act.js" ]