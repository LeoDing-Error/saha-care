/**
 * SAHA-Care Project Page
 * - Auto-detects current sprint based on today's date
 * - Highlights current sprint in cards and timeline
 * - Shows a status indicator in the hero section
 */

(function () {
  'use strict';

  const sprints = [
    { num: 1, name: 'Sprint 1 — Auth & Offline Reporting',       start: '2026-02-24', end: '2026-03-08' },
    { num: 2, name: 'Sprint 2 — Verification & Approval',        start: '2026-03-09', end: '2026-03-21' },
    { num: 3, name: 'Sprint 3 — Dashboard & Maps',               start: '2026-03-22', end: '2026-04-03' },
    { num: 4, name: 'Sprint 4 — Alerts, Functions, Polish & Demo', start: '2026-04-04', end: '2026-04-16' },
  ];

  const projectEnd = new Date('2026-04-16');

  function parseDate(str) {
    // Parse YYYY-MM-DD as local date (not UTC)
    var parts = str.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }

  function getToday() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function detectCurrentSprint() {
    var today = getToday();
    for (var i = 0; i < sprints.length; i++) {
      var s = sprints[i];
      var start = parseDate(s.start);
      var end = parseDate(s.end);
      if (today >= start && today <= end) {
        return { sprint: s, status: 'current' };
      }
    }
    // Before project start
    if (today < parseDate(sprints[0].start)) {
      return { sprint: null, status: 'before' };
    }
    // After project end
    if (today > projectEnd) {
      return { sprint: null, status: 'after' };
    }
    // Shouldn't happen if sprints are contiguous, but fall through
    return { sprint: null, status: 'between' };
  }

  function updateHeroIndicator(result) {
    var el = document.getElementById('sprint-indicator');
    if (!el) return;

    if (result.status === 'before') {
      el.textContent = 'Project starts Feb 24, 2026';
    } else if (result.status === 'after') {
      el.textContent = 'Project completed';
      el.classList.add('completed');
    } else if (result.status === 'current' && result.sprint) {
      el.textContent = 'Currently in: ' + result.sprint.name;
    } else {
      el.textContent = '';
    }
  }

  function updateSprintCards(result) {
    var cards = document.querySelectorAll('.sprint-card');
    var today = getToday();

    cards.forEach(function (card) {
      var sprintNum = parseInt(card.getAttribute('data-sprint'));
      var endStr = card.getAttribute('data-end');
      var end = parseDate(endStr);
      var startStr = card.getAttribute('data-start');
      var start = parseDate(startStr);

      if (result.status === 'current' && result.sprint && result.sprint.num === sprintNum) {
        card.classList.add('current');
      } else if (today > end) {
        card.classList.add('completed');
      }
    });
  }

  function updateTimeline(result) {
    var items = document.querySelectorAll('.timeline-item');
    var milestones = document.querySelectorAll('.timeline-milestone');
    var today = getToday();

    items.forEach(function (item) {
      var sprintNum = parseInt(item.getAttribute('data-sprint'));
      var endStr = item.getAttribute('data-end');
      var end = parseDate(endStr);

      if (result.status === 'current' && result.sprint && result.sprint.num === sprintNum) {
        item.classList.add('current');
      } else if (today > end) {
        item.classList.add('completed');
      }
    });

    milestones.forEach(function (ms) {
      var dateStr = ms.getAttribute('data-date');
      var date = parseDate(dateStr);

      if (today > date) {
        ms.classList.add('completed');
      } else if (today.getTime() === date.getTime()) {
        ms.classList.add('current');
      }
    });
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    var result = detectCurrentSprint();
    updateHeroIndicator(result);
    updateSprintCards(result);
    updateTimeline(result);
  });
})();
