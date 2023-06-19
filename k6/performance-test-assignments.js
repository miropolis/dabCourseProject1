import http from "k6/http";
import { check, sleep } from 'k6';

export const options = {
  duration: "10s",
  vus: 10,
  summaryTrendStats: ["med", "p(99)"],
};

export default function () {
  const res = http.get("http://localhost:7800/assignment-1/");
  check(res, {
    'protocol is HTTP/1.1': (r) => r.proto === 'HTTP/1.1',
  });
}