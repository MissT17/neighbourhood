// A default list of locations, in case the user
// does not share his/her location.

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

// Declaration of the variable that will contain user
// input necessary for the search of locations.

var query = "";

// Function that allows to transform a simple list
// into a list of Knockout.js objects.

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
    // Declaration of the user input as Knockout.js object that will be
    // dynamically updated.
    self.user_keyword = ko.observable();
    // Time limitation that allows to hold off the request
    // to Foursquare until the user completes the request.
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

    // Function adds a css .on class  the content when the user interacts with
    // the list of locations.
    self.new_selected = function(){
        if (this.on() === false){
            this.on(true);
            // On click user can see additional information about a location.
            if (this.id() !== undefined){
                foursquare_details(this.id());
            }
            // Allows to control the display of markers on the map for
            // selected locations in the list.
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

    // Function that allows to control the display of all markers on the map
    // if none of the locations is specifically selected.

    function new_status(all_locations){
        change_status = [];
        for (i=0;i<all_locations.length; i++){
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

    // Procative listening to the modifications of the location list to
    // change the markers on the map.

    self.locations.subscribe(function(new_loc){
        setMapOnAll(null);
        markers = [];
        new_loc.forEach(function(loc){
            var marker_pos = {lat:loc.lat(), lng:loc.lng()};
            setMarker(loc.title(),marker_pos).setMap(map);
            markers.push(marker);
            marker.addListener("click", function(){
                info_marker(this, infowindow);
                loc.on(true);
                highlight(this.position);
            });
            marker.addListener("click", toggleBounce);
        });
    });


    self.searched_position.subscribe(function(newText){
        if (self.searched_position !== "" || self.user_keyword() !== ""){
            for(i=0; i<self.locations().length; i++){
                if (self.locations()[i].title().indexOf(self.searched_position()) > -1){
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