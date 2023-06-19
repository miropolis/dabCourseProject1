import http from "k6/http";
import { check, sleep } from 'k6';
let i = 1;

export const options = {
  duration: "10s",
  vus: 10,
  summaryTrendStats: ["med", "p(99)"],
};

export default function () {
  const url = "http://localhost:7800/api/grade";

  const payload = JSON.stringify({
    user: "k6-test-user",
    assignmentNumber: 1,
    code: "Test code from k6: " + i,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
  i++;
}