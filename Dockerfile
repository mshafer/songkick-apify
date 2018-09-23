FROM apify/actor-node-basic

# Copy all files and directories from the directory to the Docker image
COPY . ./

# Install NPM packages, skip optional and development dependencies to keep the image small,
# avoid logging to much and show log the dependency tree
RUN npm install --quiet && npm list
RUN npm run build
RUN npm prune --production

# Define the start command
CMD [ "node", "$ACT_FILENAME" ]