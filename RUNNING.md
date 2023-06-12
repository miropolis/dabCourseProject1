TODO: The RUNNING.md briefly outlines steps needed to run the application.

# Steps to run

First build the grader-image

    cd grader-image
    bash ./build.sh


# Run the tests in folder e2e-playwright

    docker compose run --entrypoint=npx e2e-playwright playwright test && docker-compose rm -sf