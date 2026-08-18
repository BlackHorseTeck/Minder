FROM node:22-slim

# Install the health-check dependency used during template readiness.
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

WORKDIR /home/user/nextjs-app

# Create the App Router workspace that the coding agent is instructed to edit.
RUN npx create-next-app@15.3.3 . --yes --ts --tailwind --eslint --app --no-src-dir --use-npm --import-alias "@/*"

# Move the ready workspace, including dotfiles, to the agent's expected path.
RUN cp -a /home/user/nextjs-app/. /home/user/ && rm -rf /home/user/nextjs-app

WORKDIR /home/user
