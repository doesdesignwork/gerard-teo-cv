(function () {
  const EASY_CARD = 'https://www.easycard.com.tw/en/easycard?cls=1521769569&id=1521769904';
  const TAIPEI_METRO = 'https://english.metro.taipei/';
  const AIRPORT_MRT = 'https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/ticketson05.php';

  const dayTicketGuides = {
    1: {
      title: 'Buy transport cards on arrival',
      text: 'Best plan: buy 2 EasyCards at the Taoyuan Airport MRT station before boarding, then load enough value for the Airport MRT plus Taipei Metro/buses. If you prefer, buy a single-journey Airport MRT ticket from the station ticket machine or service counter instead.',
      links: [
        ['EasyCard guide', EASY_CARD],
        ['Airport MRT tickets', AIRPORT_MRT]
      ]
    },
    2: {
      title: 'Use EasyCard for today’s city transport',
      text: 'Use the same EasyCard for Taipei Metro and public buses. Tap in and out on the MRT, and tap when boarding and alighting from buses. Top up at Taipei Metro station machines/counters or participating convenience stores.',
      links: [
        ['Taipei Metro', TAIPEI_METRO],
        ['EasyCard guide', EASY_CARD]
      ]
    },
    3: {
      title: 'No public-transport ticket needed',
      text: 'This day is planned around a pre-booked private driver. Confirm the charter price, overtime, tolls, parking and payment method before travel. Attraction admissions and the Shifen sky lantern are separate from transport.',
      links: []
    },
    4: {
      title: 'EasyCard for MRT + Airport MRT',
      text: 'Use EasyCard for the city MRT legs and the Airport MRT. Before the airport run, check the remaining balance. At A1 Taipei Main Station you can top up, or buy an Airport MRT single-journey ticket from a ticket machine/service counter.',
      links: [
        ['Airport MRT tickets', AIRPORT_MRT],
        ['Taipei Metro', TAIPEI_METRO]
      ]
    }
  };

  function stopTicketInfo(dayNumber, stop) {
    const name = stop.name.toLowerCase();

    if (dayNumber === 1 && name.includes('taoyuan international airport')) {
      return {
        label: 'Buy here',
        title: 'EasyCard at Taoyuan Airport MRT station',
        text: 'After customs, follow Airport MRT signs. Buy one EasyCard per traveller at the Airport MRT station/service area, then top it up before entering the gates. Keep the cards for the whole trip.',
        links: [['EasyCard guide', EASY_CARD]]
      };
    }

    if (dayNumber === 1 && name.includes('airport mrt to a1')) {
      return {
        label: 'Ticket',
        title: 'EasyCard or single-journey Airport MRT ticket',
        text: 'With EasyCard, tap at the entry gate and again at A1 Taipei Main Station. Otherwise buy a single-journey ticket at the Airport MRT ticket vending machine or service counter before entering.',
        links: [['Airport MRT ticket info', AIRPORT_MRT]]
      };
    }

    if (dayNumber === 2 && (name.includes('longshan') || name.includes('ximending') || name.includes('chiang kai-shek') || name.includes('yongkang') || name.includes('huashan') || name.includes('zhongshan') || name.includes('return to roaders'))) {
      return {
        label: 'Getting here',
        title: 'Taipei Metro: use EasyCard',
        text: 'Tap in at the origin station and tap out at the destination. If your balance is low, top up at a Metro station machine/counter or participating convenience store.',
        links: [['Taipei Metro', TAIPEI_METRO]]
      };
    }

    if (dayNumber === 3 && name.includes('roaders plus pickup')) {
      return {
        label: 'Private transfer',
        title: 'Pre-book the driver, not a transit ticket',
        text: 'There is no public-transport ticket for this route. Keep the driver booking confirmation on your phone and reconfirm pickup time, total price, overtime, parking and tolls the day before.',
        links: []
      };
    }

    if (dayNumber === 4 && (name.includes('walk to a1') || name.includes('taoyuan international airport'))) {
      return {
        label: 'Airport transfer',
        title: 'Check EasyCard balance before entering A1',
        text: 'Use EasyCard if there is enough stored value. If not, top it up or buy a single-journey Airport MRT ticket from the A1 ticket machine/service counter before the gates.',
        links: [['Airport MRT ticket info', AIRPORT_MRT]]
      };
    }

    return null;
  }

  function linkHtml(links) {
    if (!links || !links.length) return '';
    return `<div class="itinerary-ticket-links">${links.map(([label,url]) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`).join('')}</div>`;
  }

  function renderDayGuide(dayNumber) {
    const guide = dayTicketGuides[dayNumber];
    if (!guide) return '';
    return `<div class="day-ticket-guide"><div class="day-ticket-icon" aria-hidden="true">票</div><div><span class="ticket-kicker">Transport tickets</span><strong>${guide.title}</strong><p>${guide.text}</p>${linkHtml(guide.links)}</div></div>`;
  }

  function injectTicketing() {
    const summary = document.getElementById('tripSummary');
    const timeline = document.getElementById('timeline');
    if (!summary || !timeline) return;

    document.querySelectorAll('.day-ticket-guide').forEach(el => el.remove());
    timeline.querySelectorAll('.itinerary-ticket-note').forEach(el => el.remove());

    if (state.selectedDay !== 0) {
      summary.insertAdjacentHTML('afterend', renderDayGuide(state.selectedDay));
    }

    const renderedCards = Array.from(timeline.querySelectorAll('.stop-card'));
    const flattened = [];
    const days = state.selectedDay === 0 ? tripDays : tripDays.filter(d => d.day === state.selectedDay);
    days.forEach(day => day.stops.forEach(stop => flattened.push({ day: day.day, stop })));

    renderedCards.forEach((card, index) => {
      const item = flattened[index];
      if (!item) return;
      const info = stopTicketInfo(item.day, item.stop);
      if (!info) return;
      const body = card.querySelector('.stop-body');
      if (!body) return;
      const html = `<div class="itinerary-ticket-note"><span>${info.label}</span><strong>${info.title}</strong><p>${info.text}</p>${linkHtml(info.links)}</div>`;
      body.insertAdjacentHTML('afterbegin', html);
    });
  }

  const originalRenderItinerary = window.renderItinerary;
  if (typeof originalRenderItinerary === 'function') {
    window.renderItinerary = function () {
      originalRenderItinerary();
      injectTicketing();
    };
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(injectTicketing, 0));
})();
