const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = require('../constants').baseUrl;
const championshipBase = require('../constants').championshipBase;

const championshipsController = {};

// Utility function for scraping drivers
const fetchDrivers = async (year, drivers) => {
  let response = null;
  try {
    response = await axios.get(`${championshipBase}/${year}/drivers.html`);
  } catch (error) {
    console.log("ERROR: Could not fetch driver's standings");
  }

  const html = response ? response.data : '';

  // Handling empty case
  if (html === '') {
    return res.json({
      year,
      drivers,
    });
  }

  const $ = cheerio.load(html);

  $('table.resultsarchive-table tbody tr', html).each(function () {
    const standing = +$(this).children('td:nth-child(2)').text().trim();

    const data = $(this).children('td:nth-child(3)');
    const url = baseUrl + data.children('a').attr('href');
    const firstName = data
      .children('a')
      .children('span:first-child')
      .text()
      .trim();
    const lastName = data
      .children('a')
      .children('span:nth-child(2)')
      .text()
      .trim();
    const shortName = data
      .children('a')
      .children('span:last-child')
      .text()
      .trim();
    const name = firstName + ' ' + lastName;
    const nationality = $(this).children('td:nth-child(4)').text().trim();
    const teamData = $(this).children('td:nth-child(5)');
    const teamUrl = baseUrl + teamData.children('a').attr('href');
    const teamName = teamData.children('a').text().trim();
    const points = +$(this).children('td:nth-child(6)').text().trim();

    const driverObj = {
      standing,
      name,
      shortName,
      url,
      nationality,
      team: {
        name: teamName,
        url: teamUrl,
      },
      points,
    };

    drivers.push(driverObj);
  });
};

const fetchTeams = async (year, teams) => {
  let response = null;
  try {
    response = await axios.get(`${championshipBase}/${year}/team.html`);
  } catch (error) {
    console.log('ERROR: Could not fetch constructors');
  }

  const html = response ? response.data : '';

  // Handling empty case
  if (html === '') {
    return res.json({
      year,
      teams,
    });
  }

  const $ = cheerio.load(html);
  $('table.resultsarchive-table tbody tr', html).each(function () {
    const standing = +$(this).children('td:nth-child(2)').text().trim();
    const data = $(this).children('td:nth-child(3)');
    const url = baseUrl + data.children('a').attr('href');
    const name = data.children('a').text().trim();
    const points = +$(this).children('td:nth-child(4)').text().trim();

    const teamObj = {
      standing,
      name,
      url,
      points,
    };

    teams.push(teamObj);
  });
};

championshipsController.driversChampController = async function (req, res) {
  const year = +req.params.year || new Date().getFullYear();
  const drivers = [];

  await fetchDrivers(year, drivers);

  return res.json({
    year,
    drivers,
  });
};

championshipsController.getDriver = async function (req, res) {
  const name = req.params.name || '';
  const year = req.params.year || new Date().getFullYear();

  const drivers = [];
  let result = {};

  await fetchDrivers(year, drivers);

  drivers.forEach((driver) => {
    if (
      driver.name.toLowerCase() === name.toLowerCase() ||
      driver.shortName.toLowerCase() === name.toLowerCase()
    ) {
      result = driver;
      return false;
    }
  });

  if (result.hasOwnProperty('name')) {
    return res.json({
      year,
      driver: result,
    });
  } else {
    return res.status(404).json({
      year,
      status: 'Could not find this driver in this year.',
      driver: {},
    });
  }
};

championshipsController.constructorsChampionshipController = async function (
  req,
  res
) {
  const year = +req.params.year || new Date().getFullYear();
  const teams = [];

  await fetchTeams(year, teams);

  return res.json({
    year,
    teams,
  });
};

championshipsController.getConstructor = async function (req, res) {
  const year = +req.params.year || new Date().getFullYear();
  const name = req.params.name;
  const teams = [];
  const result = [];

  await fetchTeams(year, teams);

  teams.forEach((team) => {
    if (team.name.toLowerCase().includes(name.toLowerCase())) {
      result.push(team);
    }
  });

  if (result.length >= 1) {
    return res.json({
      year,
      constructor: result,
    });
  } else {
    return res.status(404).json({
      year,
      status: 'Could not find this constructor in this year.',
      constructor: {},
    });
  }
};

module.exports = championshipsController;
