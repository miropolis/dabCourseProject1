# Steps to run

### First build the grader-image

    cd grader-image && bash ./build.sh && cd ..

### Then either run the development or the production configuration

Development configuration:

    docker compose up

Production configuration:

    docker compose -f docker-compose.prod.yml up -d


## Run the tests

### Run the tests in folder e2e-playwright

    docker compose run --entrypoint=npx e2e-playwright playwright test && docker-compose rm -sf

### Run performance tests (only works when application is already running)

    k6 run ./k6/performance-test-assignments.js

    k6 run ./k6/performance-test-submissions.js
