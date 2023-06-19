# Performance test results

Brief description of the used server: HTTP/1.1

Brief description of your computer: 2022 Lenovo Laptop with AMD Ryzen 6800HS Creator Edition

## Loading the assignment page

    http_reqs: 156277

    http_req_duration - median: 608.22µs

    http_req_duration - 99th percentile: 1.42ms


## Submitting assignments

    http_reqs: 2217

    http_req_duration - median: 44.86ms

    http_req_duration - 99th percentile: 96.33ms


## Reflection

Brief reflection on the results of the tests:

Retrieving the assignment page is rather fast and normally takes less than a millisecond. Submitting assignments through the /api/grade endpoint however is quite slow and takes around 45ms (median). One reason for this is that in the submitting assignment test we are submitting unique submissions (through the iteration counter), so they have to be written to the database each time. If I just submitted assignments with the same code over and over then it would be a lot faster because the database write would be skipped.