var eventrecorder = function() {
  var event_list = [];

  var _w = window;
  var _d = _w.document;
  var _b = _d.getElementsByTagName('body')[0] || _d.body;

  var bind_event_handler = function(element, eventType, func) {
    try {
      element.addEventListener(eventType, func, false);
    } catch (e) {
      try {
        element.attachEvent("on" + eventType, func);
      } catch (e) {
        try {
          var previousHandler = element['on' + eventType];
          if (typeof previousHandler !== 'function') {
            element['on' + eventType] = previousHandler;
          } else {
            // store previous handler for when we unbind
            element['previousHandler' + eventType] = previousHandler;

            element['on' + eventType] = function() {
              if (previousHandler) {
                previousHandler();
              }
              func();
            };
          }
        } catch (e) {

        }
      }
    }
  };

  var get_first_number_val_from_args = function() {
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (typeof arg == 'number') return arg;
    }

    return undefined;
  };

  var sort_events_by_timestamp = function() {

  };

  var set_event_bindings = function() {
    bind_event_handler(_d, 'mousemove', event_handler);
    bind_event_handler(_d, 'mousedown', event_handler);
    bind_event_handler(_d, 'mouseup', event_handler);
    bind_event_handler(_d, 'click', event_handler);
    bind_event_handler(_d, 'mouseover', event_handler);
    bind_event_handler(_d, 'mouseenter', event_handler);
    bind_event_handler(_w, 'scroll', event_handler);
  };

  var get_scroll_top = function() {
    return get_first_number_val_from_args(
      _w.scrollY, 
      _w.pageYOffset, 
      _d.scrollTop, 
      _b.scrollTop
    );
  };

  var get_scroll_left = function() {
    return get_first_number_val_from_args(
      _w.scrollX, 
      _w.pageXOffset, 
      _d.scrollLeft, 
      _b.scrollLeft
    );
  };

  var event_handler = function(event) {
    var _e = {
      type: event.type,
      pageX: event.pageX,
      pageY: event.pageY,
      x: event.x,
      y: event.y,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      movementX: event.movementX,
      movementY: event.movementY,
      timestamp: event.timeStamp,
      scrollLeft: get_scroll_left(),
      scrollTop: get_scroll_top()
    };

    event_list.push(_e);
  };

  var start_recording = function() {
    set_event_bindings();
  };

  var dump_events = function(stringified) {
    sort_events_by_timestamp();
    return (!!stringified) ? JSON.stringify(event_list) : event_list;
  };

  var clear_events = function() {
    event_list = [];
  };

  return {
    start: start_recording,
    dump: dump_events,
    clear: clear_events
  }
}();
