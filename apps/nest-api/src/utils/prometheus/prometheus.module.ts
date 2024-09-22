import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeGaugeProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { PrometheusMetricsService } from './prometheus.service';

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    PrometheusMetricsService,
    makeCounterProvider({
      name: 'app_request_count',
      help: 'Number of requests received', // Bu sağlama, 'app_request_count' sağlayıcısını ekler
    }),
    makeGaugeProvider({
      name: 'app_memory_usage',
      help: 'Current memory usage',
    }),
    makeGaugeProvider({
      name: 'app_cpu_usage',
      help: 'Current CPU usage',
    }),
  ],
  exports: [PrometheusMetricsService], // Servisi dışa aktarıyoruz
})
export class PrometheusMetricsModule {}
