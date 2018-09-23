FROM apify/actor-node-basic

# Copy all files and directories from the directory to the Docker image
COPY . ./

# Install NPM packages, skip optional and development dependencies to keep the image small,
# avoid logging to much and show log the dependency tree
ENV NODE_ENV=development
RUN npm install --quiet --no-optional
RUN npm run build
RUN npm prune --production
ENV NODE_ENV=production

# Define the start command
ENTRYPOINT [ "node", "dist/start_act.js" ]