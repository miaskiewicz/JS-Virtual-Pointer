virtualpointer = function() { 
    var mouse_position = {x: 1, y: 1},
        current_event_index = 0,
        event_queue = [],
        current_mouse_move_index = 0,
        mouse_move_interval = null,
        mouse_move_queue = [],
        default_interval = 20,
        first_event_offset = 50;

    function send_event(type, clientX, clientY, element, button, screenX, screenY) {
        if (!screenX) screenX = clientX + 1;
        if (!screenY) screenY = clientY + 50;

        if (!button && ( type == 'click' || type == 'mousedown' || type == 'mouseup' ) ) button = 0; // left button is default

        var detail = 0;
        if (type !== 'mousemove') {
            detail = 1;
        }

        var eventObject = document.createEvent("MouseEvent");
        eventObject.initMouseEvent(type,  true, true, window, detail, screenX, screenY, clientX, clientY, false, false, false, false, button, null);

        if (element) {
            element.dispatchEvent(eventObject);
        } else {
            // document.body.addEventListener(type, function(event) { console.log(event); });
            document.body.dispatchEvent(eventObject);
        }
    }

    function run_mouse_moves() {
        var index = current_mouse_move_index;

        send_event('mousemove', mouse_move_queue[index][0], mouse_move_queue[index][1]);
        if (index >= mouse_move_queue.length - 1) {
            window.clearInterval(mouse_move_interval);
            mouse_position = {x: mouse_move_queue[index][0], y: mouse_move_queue[index][1]};

            current_mouse_move_index = 0;

            // clear out mouse_move_queue
            while (mouse_move_queue.length > 0) {
                mouse_move_queue.pop();
            }
        }
        current_mouse_move_index++;
        
    }

    function execute_serialized_event() {
       
        var current_event = event_queue[current_event_index];
        var next_event = event_queue[current_event_index + 1];

        send_event(current_event.type, current_event.pageX, current_event.pageY, current_event.target, null, current_event.screenX, current_event.screenY);
        current_event_index += 1;

        if (next_event) {
            var offset = next_event.timestamp - current_event.timestamp;
            setTimeout(execute_serialized_event, offset);
        } else {
            // restore defaults
            current_event_index = 0;
            
            // clear out event_queue
            while (event_queue.length > 0) {
                event_queue.pop();
            }
        }
    }

    function move_mouse_to(element, duration) {
        // calculate position of element
        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = element.getBoundingClientRect();
        var y_offset = elemRect.top - bodyRect.top;
        var x_offset = elemRect.left - bodyRect.left;


        // calculate distance
        var x_distance = x_offset - mouse_position.x;
        var y_distance = y_offset - mouse_position.y;

        // determine number of increments
        var increments = duration / 20; // divide number of milliseconds for duration by 20, since we want to send events every 20ish milliseconds
        for (var i = 1; i <= increments; i++) {
            var new_x_pos = Math.round(x_distance / increments * i) + mouse_position.x;
            var new_y_pos = Math.round(y_distance / increments * i) + mouse_position.y;
            mouse_move_queue.push([new_x_pos, new_y_pos]);
        }
        mouse_move_interval = window.setInterval(run_mouse_moves, default_interval);
    }

    return {
        perform_click: function(element) {
            // calculate position of element
            var bodyRect = document.body.getBoundingClientRect(),
                elemRect = element.getBoundingClientRect();

            var y_offset = Math.round( elemRect.top - bodyRect.top );
            var x_offset = Math.round( elemRect.left - bodyRect.left );

            var clickDuration = Math.random() * (250 - 20) + 20;

            // dispatch correct sequence of events
            send_event('mousedown', x_offset, y_offset, element);
            setTimeout(function() { send_event('click', x_offset, y_offset, element); }.bind(this), clickDuration + 10);
            setTimeout(function() { send_event('mouseup', x_offset, y_offset, element); }.bind(this), clickDuration);
        },
        move_to_element_and_click: function(element, duration) {
            move_mouse_to(element, duration);
            setTimeout(function() { this.perform_click( element ); }.bind(this), duration + 100);
        },
        run_serialized_events: function(events) {
            if (!events || ! events instanceof Array) return;

            event_queue = events;
            setTimeout(function() { execute_serialized_event(); }.bind(this), first_event_offset);
        }
    }
}();
