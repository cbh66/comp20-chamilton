var map;
var currentInfoBox;

function addSelf(lat, lng) {
    var mark = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        title: "JimmyValmer",
        icon: "jv.gif"
    });
    var text = "Name: " + "JimmyValmer" + "<br />"
             + "Latitude: " + lat + "<br />"
             + "Longitude: " + lng + "<br />";
    var info = new google.maps.InfoWindow({
        content: text
    });
    google.maps.event.addListener(mark, 'click', function() {
        if(currentInfoBox) currentInfoBox.close();
        info.open(map, mark);
        currentInfoBox = info;
    });
}

function addCharMarker(character){
    var pos = character.loc;
    var mark = new google.maps.Marker({
        position: new google.maps.LatLng(pos.latitude, pos.longitude),
        map: map,
        title: character.name,
        icon: character.name + ".png"
    });
    var text = "Name: " + character.name + "<br />"
             + "Latitude: " + pos.latitude + "<br />"
             + "Longitude: " + pos.longitude + "<br />";
    if (character.note) text += "Note: " + character.note;
    var info = new google.maps.InfoWindow({
        content: text
    });
    google.maps.event.addListener(mark, 'click', function() {
        if (currentInfoBox) currentInfoBox.close();
        info.open(map, mark);
        currentInfoBox = info;
    });
}

function drawLineBetween(charPos, myPos) {
    var path = new google.maps.Polyline({
        path: [new google.maps.LatLng(charPos.latitude, charPos.longitude),
               new google.maps.LatLng(myPos.latitude, myPos.longitude)],
        geodesic: true
    });
    path.setMap(map);
}

/* Returns distance in miles */
function distBtwn(lat1, lng1, lat2, lng2) {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
    var earthRadius = 3959;
    var x1 = lat2-lat1;
    var dLat = x1.toRad();  
    var x2 = lng2-lng1;
    var dLon = x2.toRad();  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);  
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadius * c; 
}

function printDistanceBetween(char, self) {
    var elem = document.getElementById("charinfo").appendChild(document.createElement("p"));
    elem.textContent = char.name + " is "
                     + distBtwn(char.loc.latitude, char.loc.longitude,
                                self.latitude, self.longitude).toFixed(3)
                     + " mi. away";
}

function addCharacters(characterList, myPosition) {
    var compareDist = function(a, b) {
        var a_dist = distBtwn(a.loc.latitude, a.loc.longitude,
                              myPosition.latitude, myPosition.longitude);
        var b_dist = distBtwn(b.loc.latitude, b.loc.longitude,
                              myPosition.latitude, myPosition.longitude);
        if (a_dist < b_dist) {
            return -1;
        } else if (a_dist > b_dist) {
            return 1;
        } else {
            return 0;
        }
    }
    characterList.sort(compareDist);
    for (var i = 0; i < characterList.length; i++) {
        addCharMarker(characterList[i]);
        drawLineBetween(characterList[i].loc, myPosition);
        printDistanceBetween(characterList[i], myPosition);
    }
}

function addStudentMarker(student) {
    var mark = new google.maps.Marker({
        position: new google.maps.LatLng(student.lat, student.lng),
        map: map,
        title: student.name,
        icon: "student.png"
    });
    var text = "Login: " + student.login + "<br />"
             + "Latitude: " + student.lat + "<br />"
             + "Longitude: " + student.lng + "<br />"
             + "Timestamp: " + student.created_at;
    var info = new google.maps.InfoWindow({
        content: text
    });
    google.maps.event.addListener(mark, 'click', function() {
        if (currentInfoBox) currentInfoBox.close();
        info.open(map, mark);
        currentInfoBox = info;
    });
}

function addStudents(studentList) {
    for (var i = 0; i < studentList.length; i++) {
        addStudentMarker(studentList[i]);
    }
}

function send_location(position) {
    var locationGetter = new XMLHttpRequest();
    locationGetter.open("post", "http://chickenofthesea.herokuapp.com/sendLocation", true);
    locationGetter.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    locationGetter.onreadystatechange = function() {
        if (locationGetter.readyState == 4 && locationGetter.status == 200) {
            var response = JSON.parse(locationGetter.responseText);
            addCharacters(response.characters, position.coords);
            addStudents(response.students);
        }
    }
    locationGetter.send("login=JimmyValmer" + 
                        "&lat=" + position.coords.latitude +
                        "&lng=" + position.coords.longitude);
    addSelf(position.coords.latitude, position.coords.longitude);
}

function initialize() {
    var mapOptions = {
        center: { lat: 42.4069, lng: -71.1198},
        zoom: 13
    };
    map = new google.maps.Map(document.getElementById("mmap"),
        mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);
navigator.geolocation.getCurrentPosition(send_location);