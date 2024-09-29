// To demonstrate a simlpe load test amd how to obtain environment variables from command line
// k6 run demo.js --out influxdb=http://localhost:8086/k6 -e RAMPUP_DURATION=30s -e STEADY_DURATION=1m;

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import {
  generateIdentifier,
  getRandomIntInclusive,
  buildQuery,
} from './helpers.js';

export let errorRate = new Rate('errors');

// Set the duration of rampup and steady state based on environment variable(s).
var durationRampup = `${__ENV.RAMPUP_DURATION}`;
durationRampup = durationRampup === 'undefined' ? '20s' : durationRampup;

var durationSteady = `${__ENV.STEADY_DURATION}`;
durationSteady = durationSteady === 'undefined' ? '1m' : durationSteady;

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // 1 dakikada 20 VU'ya çık
    { duration: '3m', target: 100 }, // 3 dakika boyunca 20 VU'da kal
    { duration: '1m', target: 50 }, // 1 dakikada 50 VU'ya çık
    { duration: '5m', target: 100 }, // 5 dakika boyunca 50 VU'da kal
    { duration: '2m', target: 20 }, // 2 dakikada VU sayısını 0'a indir
  ],
  thresholds: {
    http_req_duration: ['p(99)<5500'], // 99% of requests must complete below 1.5s
    errors: [
      'rate<0.1', // more than 10% of errors will fail the test
      { threshold: 'rate < 5.5', abortOnFail: false, delayAbortEval: '1m' }, // more than 50% of errors will abort the test
    ],
  },
};

export default () => {
  let urlQueryParams;
  let result, response;
  let authHeaders;

  // Static Variables
  const BASE_URL = 'https://mock-api.tariksogukpinar.dev';
  const PAUSE_TIME = 1; // constant pause time

  const USERNAME = 'johndoe@gmail.com';
  const PASSWORD = 'securepassword123';

  // Dynamic Variables
  let identifier = generateIdentifier(1);
  let randomPauseTime = 0; // random pause time

  group('01. Login', function () {
    let loginRes = http.post(
      `${BASE_URL}/nest/api/v1/auth/login`,
      {
        username: USERNAME,
        password: PASSWORD,
      },
      { tags: { name: 'POST /auth/login' } },
    );

    result = check(loginRes, {
      'POST /auth/login is 200': (r) => r.status === 200,
      'logged in successfully': (resp) => resp.json('access') !== '',
    });

    errorRate.add(!result);

    authHeaders = {
      headers: { Authorization: `Bearer ${loginRes.json('access')}` },
    };

    sleep(PAUSE_TIME);
    randomPauseTime = getRandomIntInclusive(1, 5);
    sleep(randomPauseTime);
  });

  // -----------------------------------------
  group('02. Get All Products', function () {
    response = http.get(
      `${BASE_URL}/go/api/v1/products`,
      Object.assign(authHeaders, { tags: { name: 'GET api/v1/products' } }),
    );

    result = check(response, {
      'GET api/v1/products is 200': (r) => r.status == 200,
    });

    errorRate.add(!result);

    sleep(PAUSE_TIME);
    randomPauseTime = getRandomIntInclusive(1, 5);
    sleep(randomPauseTime);
  });

  // -----------------------------------------

  group('03. Get All Users', function () {
    response = http.get(
      `${BASE_URL}/nest/api/v1/users`,
      Object.assign(authHeaders, { tags: { name: 'GET /api/v1/users' } }),
    );

    result = check(response, {
      'GET /api/v1/users is 404': (r) => r.status == 404,
    });

    errorRate.add(!result);

    sleep(PAUSE_TIME);
    randomPauseTime = getRandomIntInclusive(1, 5);
    sleep(randomPauseTime);

    console.log('response.request.url:' + response.request.url);
  });
};
