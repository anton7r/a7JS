var socket = new WebSocket("localhost:{{ port }}");

socket.onopen = function(e) {
    alert("[open] Connection established");
    alert("Sending to server");
    socket.send("Io sono Aldo");
};

socket.onmessage = function(ev) {
    alert(`[message] Data received from server: ${ev.data}`);
};

socket.onclose = function(ev) {
    if (ev.wasClean) {
        alert(`[close] Connection closed cleanly, code=${ev.code} reason=${ev.reason}`);
    } else {
        alert('[close] Connection is dead!');
    }
};

socket.onerror = function(error) {
    alert(`[error] ${error.message}`);
};