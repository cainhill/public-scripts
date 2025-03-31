function colorCodeEvents() {
  var calendarIds = ['calendarId1@gmail.com', 'calendarId2@group.calendar.google.com']; // Replace with your calendar IDs
  var now = new Date();
  var threeMonthsLater = new Date();
  threeMonthsLater.setMonth(now.getMonth() + 3);

  for (var i = 0; i < calendarIds.length; i++) {
    var calendar = CalendarApp.getCalendarById(calendarIds[i]);
    if (!calendar) {
      Logger.log("Calendar not found: " + calendarIds[i]);
      continue;
    }

    var events = calendar.getEvents(now, threeMonthsLater);

    for (var j = 0; j < events.length; j++) {
      var event = events[j];
      var title = event.getTitle();
      var eventColor = event.getColor();
      var defaultColor = calendar.getColor(); //get the default calendar color.

      // Rule 1: Events starting with "-" or "Task:" to Banana yellow
      if (title.startsWith("-") || title.startsWith("Task:")) {
        event.setColor(CalendarApp.EventColor.BANANA_YELLOW);
      }
      // Rule 2: Banana yellow events without "-" or "Task:" to default color
      else if (eventColor === CalendarApp.EventColor.BANANA_YELLOW) {
        if (!title.startsWith("-") && !title.startsWith("Task:")) {
          event.setColor(defaultColor);
        }
      }

      // Rule 3: Events with "!", "TBC", "TBD", "#tobook", "#topay", "#toconfirm" to dark red
      if (eventIsMissingDetails(event)) {
        event.setColor(CalendarApp.EventColor.DARK_RED);
      }
      // Rule 4: dark red events with none of the above to default color.
      else if (eventColor === CalendarApp.EventColor.DARK_RED){
        event.setColor(defaultColor);
      }
    }
  }
}

function makeTasksYellow(event, defaultColour) {
  if (title.startsWith("-") || title.startsWith("Task:")) {
    event.setColor(CalendarApp.EventColor.BANANA_YELLOW);
  }
  else {
    if (event.getColor() === CalendarApp.EventColor.BANANA_YELLOW) {
      event.setColor(defaultColor);
    }
  }
}

function eventIsMissingDetails(event) {
  var title = event.getTitle();
  var location = event.getLocation();
  return (
    title.includes("!") ||
    title.includes("TBC") ||
    title.includes("TBD") ||
    title.includes("#tobook") ||
    title.includes("#topay") ||
    title.includes("#toconfirm") ||
    (location && (location.includes("TBC") || location.includes("TBD")))
  );
}
