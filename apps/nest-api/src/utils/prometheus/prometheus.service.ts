import { Injectable, Inject } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';

@Injectable()
export class PrometheusMetricsService {
  constructor(
    @Inject('app_request_count')
    private readonly requestCounter: Counter<string>,
    @Inject('app_memory_usage')
    private readonly memoryUsageGauge: Gauge<string>,
    @Inject('app_cpu_usage') private readonly cpuUsageGauge: Gauge<string>,
  ) {}

  trackRequest() {
    this.requestCounter.inc(); // İstek geldikçe sayaç artar
    console.log(`Request counter incremented.`);
  }

  trackMemoryUsage(memoryUsage: number) {
    this.memoryUsageGauge.set(memoryUsage); // Bellek kullanımı güncellenir
    console.log(`Memory usage set to: ${memoryUsage}`);
  }

  trackCpuUsage(cpuUsage: number) {
    this.cpuUsageGauge.set(cpuUsage); // CPU kullanımı güncellenir
    console.log(`CPU usage set to: ${cpuUsage}`);
  }
}
