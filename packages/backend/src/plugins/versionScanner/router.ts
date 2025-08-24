import { LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { VersionScannerService } from './versionScanner';
import { UpgradeMetricsService } from "./upgradeMetricsService"

// This file now only defines the router and its endpoints.
export async function createRouter(options: {
  logger: LoggerService;
  versionScannerService: VersionScannerService;
  upgradeMetricsService: UpgradeMetricsService;
}): Promise<express.Router> {
  const { logger, versionScannerService, upgradeMetricsService } = options;
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/version-info', async (_, res) => {
    const data = await versionScannerService.getVersionInfo();
    res.json({ results: data });
  });

  router.get('/project-analysis', async (_, res) => {
    const data = await versionScannerService.getProjectAnalysisData();
    res.json({ results: data });
  });

  router.get('/upgrade-metrics', async (_, res) => {
    const data = await upgradeMetricsService.getUpgradeMetrics();
    res.json({ metrics: data });
  });
  // router.post('/submit-feedback', async (req, res) => {
  //   const result = await upgradeMetricsService.submitFeedback(req.body);
  //   res.status(201).json(result);
  // });


  return router;
}