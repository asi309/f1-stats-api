const express = require('express');

const scheduleController = require('./controllers/schedule');
const nextEventController = require('./controllers/nextEvent');
const championshipsController = require('./controllers/championships');

const router = express.Router();

// Schedule routes
router.get('/schedule/:year', scheduleController.getSchedule);
router.get('/schedule', scheduleController.getSchedule);

// Next Event
router.get('/next-race', nextEventController.getNextRace);

// Championships
// Drivers
router.get('/drivers', championshipsController.driversChampController);
router.get('/drivers/:year', championshipsController.driversChampController);
router.get('/driver/:name', championshipsController.getDriver);
router.get('/driver/:year/:name', championshipsController.getDriver);
// Constructors
router.get(
  '/constructors',
  championshipsController.constructorsChampionshipController
);
router.get(
  '/constructors/:year',
  championshipsController.constructorsChampionshipController
);
router.get('/constructor/:name', championshipsController.getConstructor);
router.get('/constructor/:name/:year', championshipsController.getConstructor);

module.exports = router;
