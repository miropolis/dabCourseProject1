TODO: There is a brief description of the application in REFLECTION.md that highlights the key design decisions for the application. The document also contains a reflection of possible improvements that should be done to improve the performance of the application.

# Key design decisions

## UI design

I chose to make the UI design as replicable as possible for different programming assignments, so the UI looks the same for each assignment. Using astro and Svelte components I was able to implement all the required functionality for passing with merits.

## Caching

All requests to the database are cached using a Redis cache. I chose this approach because we already used the Redis cache during the course and it would be scalable to multiple deployments of programming-api.

## Grader load balancing: Redis Streams

Decided to use Redis for streams and grader load balancing because I do not have any experience with any other streams implementation and we already used Redis in the course.
Would it be better to have wake up functionality for the grader-api consumer? "implement wake up functionality upon submission through GradingButton, which starts the consumer for a certain amount of time"

# Reflection of possible improvements

## Performance

There could be multiple deployments of programming-api to prevent any bottlenecks in the backend.

Using the Redis Stream, an arbitrary number of grader-api's can be deployed, hence this should not present a bottleneck.

Database: At the moment there is only one instance of the database, if the application was being used by a large amount of users at the same time it might be neccessary to distribute the load on the database further than PostgreSQL can do by itself.

## Dynamic number of assignments

The routing in programming-ui is mostly dynamic so it could serve an arbitrary number of assignments. However [assignment].astro in programming-ui is not dynamic but statically serves 4 assignments. The application could be made fully dynamic by enabling server side rendering and adjusting the nginx and Docker configurations accordingly.

## Design

The application is not optimized for smaller screen sizes and this could be improved upon.

The past submissions are also not updated on pressing the submission button but only after the page is reloaded, which could be improved.

# Open questions

## Implementation of grader-api

I was wondering if it would be better to have some kind of "wake-up" functionality for the Redis Consumers in grader-api/app.js instead of the while(true) loop which checks the Redis Stream in short intervals. E.g., there could be a wake-up functionality which would be called by the programming-api upon receiving a submission and keeping the consumer listening for 5 minutes or until there are no more submissions in the Redis Stream. Then, the 2 grader-api deployments would not always need to be listening.