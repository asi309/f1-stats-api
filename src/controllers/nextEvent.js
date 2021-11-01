const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = require('../constants').baseUrl;
const scheduleUrl = require('../constants').schedule;

const nextEventController = {};

nextEventController.getNextRace = async function (req, res) {
  const year = new Date().getFullYear();
  let response = null;
  const events = [];
  let count = 0;
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
      events,
    });
  }

  const $ = cheerio.load(html);

  $('a.event-item-wrapper', html).each(function () {
    const eventCard = $(this)
      .children('fieldset')
      .children('div.container')
      .children('div.row')
      .children('div.race-card');

    // Checking event completed
    const eventCompleted =
      eventCard
        .children('div.event-info')
        .children('div.event-completed')
        .attr('class') !== undefined
        ? true
        : false;

    if (eventCompleted) {
      round += 1;
      return true;
    }

    if (!eventCompleted && count === 0) {
      const url = baseUrl + $(this).attr('href');

      // This route only returns race schedules
      if (eventCard.attr('class') !== undefined) {
        const eventDescription = eventCard
          .children('div.event-details')
          .children('div.event-description');
        const title = eventDescription
          .children('div.event-title')
          .text()
          .trim();
        const place = eventDescription
          .children('div.event-place')
          .text()
          .trim();

        // Getting start and end dates
        const eventInfo = eventCard.children('div.event-info');
        let startDate,
          endDate = '';
        const start = eventInfo
          .children('div.event-space-time')
          .children('div.date-month')
          .children('p')
          .children('span.start-date')
          .text()
          .trim();
        const end = eventInfo
          .children('div.event-space-time')
          .children('div.date-month')
          .children('p')
          .children('span.end-date')
          .text()
          .trim();

        if (eventCompleted) {
          const eventMonth = eventInfo
            .children('div.event-completed')
            .children('span.month-wrapper')
            .text()
            .trim();
          startDate = `${start} ${eventMonth} ${year}`;
          endDate = `${end} ${eventMonth} ${year}`;
        } else {
          const eventMonth = eventInfo
            .children('div.event-space-time')
            .children('div.date-month')
            .children('span.month-wrapper')
            .text()
            .trim();
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
        };

        events.push(eventObj);

        count += 1;
        return false;
        // return res.json({
        //   year,
        //   nextEvent: eventObj,
        // });
      }
    }
  });

  if (count === 1) {
    return res.json({
      year,
      nextEvent: events[0],
    });
  }

  return res.json({
    year,
    nextEvent: 'No event found',
  });
};

module.exports = nextEventController;
