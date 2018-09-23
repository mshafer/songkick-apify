FROM apify/actor-node-basic

# Copy all files and directories from the directory to the Docker image
COPY . ./

# Install NPM packages, skip optional and development dependencies to keep the image small,
# avoid logging to much and show log the dependency tree
RUN npm install --quiet --only=prod --no-optional \
 && npm list

# Define that start command
CMD [ "babel", "./src", "--out-dir", "dist/", "--copy-files" ]
CMD [ "node", "dist/acts/fetch_tracked_and_similar_artists.js" ]