/* A default list of locations, in case the user
does not share his/her location. */

var locations = [
    {title: "Park Ave Penthouse",
    location: {lat: 40.7713024, lng: -73.9632393},
    on: false},
    {title: "Chelsea Loft",
    location: {lat: 40.7444883, lng: -73.9949465},
    on: false},
    {title: "Union Square Open Floor Plan",
    location: {lat: 40.7347062, lng: -73.9895759},
    on: false},
    {title: "East Village Hip Studio",
    location: {lat: 40.7281777, lng: -73.984377},
    on: false},
    {title: "TriBeCa Artsy Bachelor Pad",
    location: {lat: 40.7195264, lng: -74.0089934},
    on: false},
    {title: "Chinatown Homey Space",
    location: {lat: 40.7180628, lng: -73.9961237},
    on: false}
    ];


// Create the Knockout.js location object

var Location = function (location) {
    var self = this;
    self.title = ko.observable(location.title);
    self.lat = ko.observable(location.location.lat);
    self.lng = ko.observable(location.location.lng);
    self.visibility = ko.observable(true);
    self.on = ko.observable(location.on);
    self.id = ko.observable(location.id);
};


/* Declaration of the variable that will contain user
input necessary for the search of locations. */

var query = "";


/* Function that allows to transform a simple list
into a list of Knockout.js objects. */

function list(data){
    var list_of_locations = [];
    for(i=0; i<data.length; i++){
        data[i].on = false;
        list_of_locations.push(new Location(data[i]));
    }
    return list_of_locations;
}


// Initialization of the Knockout.js ViewModel

function LocationViewModel(){
    var self = this;
    /* Declaration of user input as Knockout.js object that will be
    dynamically updated. */
    self.user_keyword = ko.observable();
    /* Time limitation that allows to hold off the request
    to Foursquare until the user completes the request. */
    self.user_keyword.extend({ rateLimit: 500 });
    // Proactive listening to the latest updates of the user input.
    self.user_keyword.subscribe(function (newText) {
        if (self.user_keyword() !== "" && pos.lat !== undefined) {
            query = self.user_keyword();
            foursquare(self, pos, query, 10);
        } else {
            locations = [];
            self.locations(list(locations));
        }
    });


    /* Function activates clicked locations in the list and
    displays the location details when the user interacts with
    the list of locations. */

    self.new_selected = function(){
        if (this.on() === false){
            this.on(true);
            if (this.id() !== undefined){
                foursquare_details(this.id());
            }
            /* Allows to control the display of markers on the map for
            selected locations in the list. */
            for (i=0;i<self.locations().length; i++){
                if (this.title() === self.locations()[i].title()){
                    markers[i].setVisible(true);
                } else if (self.locations()[i].on() === true){
                    markers[i].setVisible(true);
                } else {
                    markers[i].setVisible(false);
                }
            }
        } else {
            this.on(false);
            for (i=0;i<self.locations().length; i++){
                if(this.title() === self.locations()[i].title()){
                    markers[i].setVisible(false);
                    /* Display of location details at
                    the bottom of the screen. */
                    list_foursquare.forEach(function(element){
                        if (element.name === markers[i].title){
                            position_number = list_foursquare.indexOf(element);
                            if (list_foursquare.length > 1){
                                list_foursquare.splice(position_number, 1);
                                var last_call = list_foursquare[list_foursquare.length-1];
                                var content = `<div>
                                    <p style="color: #B22222; font-weight:bold;
                                        font-size:20px; text-align:center;">
                                    More details about the <i>${last_call.name}:<i></p>
                                    <p><b>Description:</b> ${last_call.description}<br>
                                    <b>Home:</b> ${last_call.phone} <br>
                                    <b>Opening hours:</b> ${last_call.hours}<br>
                                    <b>Latest shared photos by customers:</b><br>
                                    <img style="margin-top:10px; margin-left:20px;"
                                        src="${last_call.photo1}">
                                    <img style="margin-top:10px; margin-left:20px;"
                                        src="${last_call.photo2}">
                                    </p>
                                    </div>`;
                                document.getElementById("location_details")
                                    .innerHTML = content;
                            } else {
                                list_foursquare.splice(position_number, 1);
                                content = "";
                                document.getElementById("location_details")
                                    .innerHTML = content;
                            }
                        }
                    });
                    new_status(self.locations());
                } else {
                    if (self.locations()[i].on() === true){
                        markers[i].setVisible(true);
                    } else{
                    markers[i].setVisible(false);
                    }
                }
            }
        }
    };


    /* Function that allows to control the display of all markers on the map,
    if none of the locations is specifically selected. */

    function new_status(all_locations){
        change_status = [];
        for (i=0; i<all_locations.length; i++){
            if (all_locations[i].on() === false){
                change_status.push(all_locations[i].on());
            }
        }
        if (change_status.length == all_locations.length){
            markers.forEach(function(marker){
                marker.setVisible(true);
            })
        }
    };

    self.searched_position = ko.observable();
    self.locations = ko.observableArray(list(locations));


    /* Proactive listening to the modifications of the location list and
    change of markers on the map. */

    self.locations.subscribe(function(new_loc){
        setMapOnAll(null);
        markers = [];
        selected_places = document.getElementById("places_list")
                        .getElementsByTagName("li");
        new_loc.forEach(function(loc){
            var marker_pos = {lat:loc.lat(), lng:loc.lng()};
            setMarker(loc.title(),marker_pos).setMap(map);
            markers.push(marker);
            marker.addListener("click", function(){
                info_marker(this, infowindow);
                title = this.title;
                Array.from(selected_places).forEach(function(item){
                    if ((item.textContent == title) && (loc.on(false))){
                        item.click();
                    }
                });
                highlight(this.position);
            });
            marker.addListener("click", toggleBounce);
        });
    });


    /* Proactive listening to the modifications of the field allowing to filter
    through available locations and display of markers on the map. */

    self.searched_position.subscribe(function(newText){
        if (self.searched_position !== "" || self.user_keyword() !== ""){
            for(i=0; i<self.locations().length; i++){
                if (self.locations()[i].title()
                    .indexOf(self.searched_position()) > -1){
                        self.locations()[i].visibility(true);
                        markers[i].setMap(map);
                } else {
                    markers[i].setMap(null);
                    self.locations()[i].visibility(false);
                }
            }
        } else  {
            self.test(true);
        }
    });
}

ko.applyBindings(new LocationViewModel());