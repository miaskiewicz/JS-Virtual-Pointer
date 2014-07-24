virtualpointer = function() { 
    // some defaults
    var mouse_position = {x: 1, y: 1},
        event_queue = [],
        default_interval = 20,
        first_event_offset = 50,
        click_duration = Math.random() * (250 - 20) + 20,
        default_screen_x_offset = 1,
        default_screen_y_offset = 30;

    function send_event(type, clientX, clientY, element, button, screenX, screenY) {
        // calculate screenX and screenY if not provided
        if (!screenX) screenX = clientX + default_screen_x_offset;
        if (!screenY) screenY = clientY + default_screen_y_offset;

        // if button is not specified, assume the button is the left mouse button
        if (!button && ( type == 'click' || type == 'mousedown' || type == 'mouseup' ) ) button = 0; // left button is default

        // detail is the value for # of times this element has been clicked, set it to 1 when doing click events
        var detail = (type !== 'mousemove') ? 1 : 0;

        // construct new event object
        var eventObject = document.createEvent("MouseEvent");
        eventObject.initMouseEvent(type,  true, true, window, detail, screenX, screenY, clientX, clientY, false, false, false, false, button, null);

        // if element specified, fire element on the event object
        if (element) {
            element.dispatchEvent(eventObject);
        // otherwise fire it on document.body
        } else {
            document.body.dispatchEvent(eventObject);
        }
    }

    function process_event_queue() {
        if (event_queue.length) {
            var current_event = event_queue[0];
            var next_event = event_queue[1];

            send_event(current_event.type, current_event.pageX, current_event.pageY, current_event.target, null, current_event.screenX, current_event.screenY);

            if (next_event) {
                var offset = next_event.timestamp - current_event.timestamp;
                setTimeout(process_event_queue, offset);
            }
            event_queue.shift();
        }
    }

    function build_mouse_movement_queue(element, duration) {
        // calculate position of element
        var body_rect = document.body.getBoundingClientRect(),
            elem_rect = element.getBoundingClientRect();
        var y_offset = elem_rect.top - body_rect.top;
        var x_offset = elem_rect.left - body_rect.left;

        // calculate distance
        var x_distance = x_offset - mouse_position.x;
        var y_distance = y_offset - mouse_position.y;

        // determine number of increments
        var increments = duration / default_interval; // divide number of milliseconds for duration by 20, since we want to send events every 20ish milliseconds
        for (var i = 1; i <= increments; i++) {
            var new_x_pos = Math.round(x_distance / increments * i) + mouse_position.x;
            var new_y_pos = Math.round(y_distance / increments * i) + mouse_position.y;
            event_queue.push({pageX: new_x_pos, pageY: new_y_pos, screenX: new_x_pos + default_screen_x_offset, screenY: new_y_pos + default_screen_y_offset, type: "mousemove", timestamp: i * default_interval});
        }
        
    }
    function build_click_event_queue(element) {
        // calculate position of element
        var body_rect = document.body.getBoundingClientRect(),
            elem_rect = element.getBoundingClientRect();

        var y_offset = Math.round( elem_rect.top - body_rect.top );
        var x_offset = Math.round( elem_rect.left - body_rect.left );

        // get timestamp of last event in queue
        var last_timestamp = (event_queue.length) ? event_queue[event_queue.length - 1].timestamp : 0;

        // construct correct sequence of events for mouse movement, mousedown, mouseup, then click
        event_queue.push({type: "mousedown", pageX: x_offset, pageY: x_offset, screenX: x_offset + default_screen_x_offset, screenY: y_offset + default_screen_y_offset, timestamp: last_timestamp});
        event_queue.push({type: "mouseup", pageX: x_offset, pageY: x_offset, screenX: x_offset + default_screen_x_offset, screenY: y_offset + default_screen_y_offset, timestamp: last_timestamp + click_duration});
        event_queue.push({type: "click", pageX: x_offset, pageY: x_offset, screenX: x_offset + default_screen_x_offset, screenY: y_offset + default_screen_y_offset, timestamp: last_timestamp + click_duration + 10});
    }

    return {
        // exposed functions that can be valled using virtualpointer.function_name();
        move_mouse_to_element: function(element, duration) {
            build_mouse_movement_queue(element, duration);
            setTimeout(function() { process_event_queue(); }.bind(this), first_event_offset);
        },
        click_element: function(element) {
            build_click_event_queue(element);
            setTimeout(function() { process_event_queue(); }.bind(this), first_event_offset);
        },
        move_to_element_and_click: function(element, duration) {
            build_mouse_movement_queue(element, duration);
            build_click_event_queue(element);
            setTimeout(function() { process_event_queue(); }.bind(this), first_event_offset);
        },
        run_serialized_events: function(events) {
            if (!events || ! events instanceof Array) return;

            event_queue = events;
            setTimeout(function() { process_event_queue(); }.bind(this), first_event_offset);
        }
    }
}();
