virtualpointer = function() { 
    
    return {
        mouse_position: {x: 1, y: 1},
        current_event_index: 0,
        event_queue: [],
        current_mouse_move_index: 0,
        mouse_move_interval: null,
        mouse_move_queue: [],
        default_interval: 20,
        first_event_offset: 50,
        send_event: function(type, clientX, clientY, element, button, screenX, screenY) {
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
                //document.body.addEventListener(type, function(event) { console.log(event); });
                document.body.dispatchEvent(eventObject);
            }
        },
        run_mouse_moves: function() {
            var index = this.current_mouse_move_index;
            this.send_event('mousemove', this.mouse_move_queue[index][0], this.mouse_move_queue[index][1]);
            if (index >= this.mouse_move_queue.length - 1) {
                window.clearInterval(this.mouse_move_interval);
                this.mouse_position = {x: this.mouse_move_queue[index][0], y: this.mouse_move_queue[index][1]};
                this.mouse_move_queue = [];
            }
            this.current_mouse_move_index++;
            
        },
        move_mouse_to: function(element, duration) {
            // calculate position of element
            var bodyRect = document.body.getBoundingClientRect(),
                elemRect = element.getBoundingClientRect();
            var y_offset = elemRect.top - bodyRect.top;
            var x_offset = elemRect.left - bodyRect.left;


            // calculate distance
            var x_distance = x_offset - this.mouse_position.x;
            var y_distance = y_offset - this.mouse_position.y;

            // determine number of increments
            var increments = duration / 20; // divide number of milliseconds for duration by 20, since we want to send events every 20ish milliseconds
            for (var i = 1; i <= increments; i++) {
                var new_x_pos = Math.round(x_distance / increments * i) + this.mouse_position.x;
                var new_y_pos = Math.round(y_distance / increments * i) + this.mouse_position.y;
                this.mouse_move_queue.push([new_x_pos, new_y_pos]);
                
            }
            this.mouse_move_interval = window.setInterval(this.run_mouse_moves.bind(this), this.default_interval);
        },
        perform_click: function(element) {
            // calculate position of element
            var bodyRect = document.body.getBoundingClientRect(),
                elemRect = element.getBoundingClientRect();

            var y_offset = Math.round( elemRect.top - bodyRect.top );
            var x_offset = Math.round( elemRect.left - bodyRect.left );

            var clickDuration = Math.random() * (250 - 20) + 20;

            this.send_event('mousedown', x_offset, y_offset, element);


            setTimeout(function() { this.send_event('click', x_offset, y_offset, element); }.bind(this), clickDuration - 10);
            setTimeout(function() { this.send_event('mouseup', x_offset, y_offset, element); }.bind(this), clickDuration);
        },
        move_to_element_and_click: function(element, duration) {
            this.move_mouse_to(element, duration);
            setTimeout(function() { this.perform_click( element ); }.bind(this), duration + 50);
        },
        execute_serialized_event: function() {
           
            var current_event = this.event_queue[this.current_event_index];
            var next_event = this.event_queue[this.current_event_index + 1];

            this.send_event(current_event.type, current_event.pageX, current_event.pageY, current_event.target, null, current_event.screenX, current_event.screenY);
            this.current_event_index += 1;

            if (next_event) {
                var offset = next_event.timestamp - current_event.timestamp;
                setTimeout(this.execute_serialized_event.bind(this), offset);
            } else {
                // restore defaults
                this.current_event_index = 0;
                this.event_queue = [];
            }
        },
        run_serialized_events: function(events) {
            if (!events || ! events instanceof Array) return;

            this.event_queue = events;
            setTimeout(function() { this.execute_serialized_event(); }.bind(this), this.first_event_offset);
        }
    }
}();