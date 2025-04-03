var CONFIG = {
  primaryCalendars = [
    'calendarId1@gmail.com',
    'calendarId2@group.calendar.google.com'
  ]
};

function colorCodeEvents() {
  var now = new Date();
  var threeMonthsLater = new Date();
  threeMonthsLater.setMonth(now.getMonth() + 3);
  for (var i = 0; i < CONFIG.primaryCalendars.length; i++) {
    var calendar = CalendarApp.getCalendarById(calendarIds[i]);
    var events = calendar.getEvents(now, threeMonthsLater);
    for (var j = 0; j < events.length; j++) {
      appleRules(events[i]);
    }
  }
}

function applyRules(event) {
  applyYellowRule(event);
  applyRedRule(event);
}

function applyYellowRule(event) {
  var title = event.getTitle();
  var defaultColor = event.getCalendar().getColor();
  if (title.startsWith("-") || title.startsWith("Task:")) {
    event.setColor(CalendarApp.EventColor.BANANA_YELLOW);
  }
  else if (event.getColor() === CalendarApp.EventColor.BANANA_YELLOW) {
    event.setColor(defaultColor);
  }
}

function applyRedRule(event) {
  var title = event.getTitle();
  var defaultColor = event.getCalendar().getColor();
  if (eventIsMissingDetails(event)) {
    event.setColor(CalendarApp.EventColor.DARK_RED);
  }
  else if (event.getColor() === CalendarApp.EventColor.DARK_RED) {
    event.setColor(defaultColor);
  }
}

function eventIsMissingDetails(event) {
  var title = event.getTitle();
  var location = event.getLocation();
  return (
    title.startsWith("?") ||
    title.includes("!") ||
    title.includes("TBC") ||
    title.includes("TBD") ||
    title.includes("#tobook") ||
    title.includes("#topay") ||
    title.includes("#unpaid") ||
    title.includes("#toconfirm") ||
    (location && (location.includes("TBC") || location.includes("TBD")))
  );
}
