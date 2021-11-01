const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = require('../constants').baseUrl;
const scheduleUrl = require('../constants').schedule;

const scheduleController = {};

scheduleController.getSchedule = async function (req, res) {
  const year = +req.params.year || new Date().getFullYear();
  let response = null;
  const events = [];
  let isNext = false;
  let round = 1;

  try {
    response = await axios.get(`${scheduleUrl}/${year}.html`);
  } catch (error) {
    console.log('Error: Could not get response from site.');
  }

  const html = response ? response.data : '';

  // Handling empty case
  if (html === '') {
    return res.json({
      year,
      events
    });
  }

  const $ = cheerio.load(html);

  $('a.event-item-wrapper', html).each(function () {
    let winner,
      second,
      third = '';
    const url = baseUrl + $(this).attr('href');
    const eventCard = $(this)
      .children('fieldset')
      .children('div.container')
      .children('div.row')
      .children('div.race-card');

    // This route only returns race schedules
    if (eventCard.attr('class') !== undefined) {
      const eventDescription = eventCard
        .children('div.event-details')
        .children('div.event-description');
      const title = eventDescription.children('div.event-title').text().trim();
      const place = eventDescription.children('div.event-place').text().trim();

      // Checking event completed
      const eventCompleted =
        eventCard
          .children('div.event-info')
          .children('div.event-completed')
          .attr('class') !== undefined
          ? true
          : false;

      // Getting start and end dates
      const eventInfo = eventCard.children('div.event-info');
      let startDate,
        endDate = '';
      const start = eventInfo
        .children('div.event-space-time')
        .children('div.date-month')
        .children('p')
        .children('span.start-date')
        .text().trim();
      const end = eventInfo
        .children('div.event-space-time')
        .children('div.date-month')
        .children('p')
        .children('span.end-date')
        .text().trim();

      if (eventCompleted) {
        const eventMonth = eventInfo
          .children('div.event-completed')
          .children('span.month-wrapper')
          .text().trim();
        startDate = `${start} ${eventMonth} ${year}`;
        endDate = `${end} ${eventMonth} ${year}`;

        // Adding podium results for completed races
        const eventResult = eventCard
          .children('div.event-details')
          .children('div.event-result');
        winner = eventResult
          .children('div.position-1')
          .children('div.driver-info-wrapper')
          .children('div.driver-info')
          .children('span')
          .text().trim();
        second = eventResult
          .children('div.position-2')
          .children('div.driver-info-wrapper')
          .children('div.driver-info')
          .children('span')
          .text().trim();
        third = eventResult
          .children('div.position-3')
          .children('div.driver-info-wrapper')
          .children('div.driver-info')
          .children('span')
          .text().trim();
      } else {
        const eventMonth = eventInfo
          .children('div.event-space-time')
          .children('div.date-month')
          .children('span.month-wrapper')
          .text().trim()
        startDate = `${start} ${eventMonth} ${year}`;
        endDate = `${end} ${eventMonth} ${year}`;
      }

      const eventObj = {
        round,
        url,
        title,
        place,
        startDate,
        endDate,
        nextEvent: isNext,
        isComplete: eventCompleted,
      };

      if (eventCompleted) {
        eventObj.results = {
          winner,
          second,
          third,
        };
      }

      events.push(eventObj);
      round += 1;
    }
  });

  const idx = events.findIndex((event) => event.isComplete === false);

  if (idx !== -1) {
    events[idx].nextEvent = true;
  }

  return res.json({
    year,
    events,
  });
};

module.exports = scheduleController;
