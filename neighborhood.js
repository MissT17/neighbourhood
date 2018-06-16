'use strict';

/**
* Declare all the variables. 
*/

var backToNY;
var infowindow;
var map;
var markers = [];
var pos = {};
var shareLoc;
var query = "";


var location_options_visible = ko.observable(false);
var loader_visible = ko.observable(false);
var share_location_visible = ko.observable(false);
var New_York_visible = ko.observable(true);
var location_details = ko.observable();

/**
* Create the Knockout.js location object
*/ 

var Location = function (location) {
    var self = this;
    self.id = location.id;
    self.title = location.title;
    self.lat = location.location.lat;
    self.lng = location.location.lng;
    self.visibility = ko.observable(true);
    self.on = ko.observable(location.on);
};

/** Function that allows to transform a simple list
* into a list of Knockout.js objects. 
*/

function list(data){
    var list_of_locations = [];
    for(let i=0; i<data.length; i++){
        data[i].on = false;
        list_of_locations.push(new Location(data[i]));
    }
    return list_of_locations;
}

/**
*  Initialization of the Knockout.js ViewModel
*/

function LocationViewModel(){
    var self = this;
    self.searched_position = ko.observable();
    self.locations = ko.observableArray();
    // Declaration of user input as Knockout.js object that will be
    // dynamically updated.
    self.user_keyword = ko.observable("");
    //  Time limitation that allows to hold off the request
    // to Foursquare until the user completes the request. 
    self.user_keyword.extend({ rateLimit: 500 });
    // Proactive listening to the latest updates of the user input.
    self.user_keyword.subscribe(function (newText) {
        if (self.user_keyword() !== "" && pos.lat !== undefined) {
            list_foursquare = [];
            query = self.user_keyword();
            foursquare(self, pos, query, 10);
        } else {
            locations = [];
            self.locations(list(locations));
            //console.log('after user input', self.locations());
        }
    });

    /** 
    * Function activates clicked locations in the list and
    * displays the location details when the user interacts with
    * the list of locations. 
    */

    self.new_selected = function(loc){
        loc = loc || this;
        if (loc.on() === false){
            loc.on(true);
            if (loc.id !== undefined){
                foursquare_details(loc.id);
            }
            // Allows to control the display of markers on the map for
            //selected locations in the list.
            for(let i=0;i<self.locations().length; i++){
                if (loc.title === self.locations()[i].title){
                    setMapOnAll(map);
                    markers[i].setVisible(true);
                    markers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                    markers[i].setAnimation(google.maps.Animation.BOUNCE);
                } 
            }
        } else {
            loc.on(false);
            for(let i=0;i<self.locations().length; i++){
                if(loc.title === self.locations()[i].title){
                    markers[i].setIcon(null);
                    markers[i].setAnimation(null);
                    // Display of location details at
                    //the bottom of the screen.
                    list_foursquare.forEach(function(element){
                        if (element.name === markers[i].title){
                            var position_number = list_foursquare.indexOf(element);
                            if (list_foursquare.length > 1){
                                list_foursquare.splice(position_number, 1);
                                var last_call = list_foursquare[list_foursquare.length-1];
                                location_details(showContent(last_call));
                            } else {
                                // console.log('list_foursquare', list_foursquare);
                                list_foursquare.splice(position_number, 1);
                                location_details("");
                            }
                        }
                    });
                    new_status(self.locations());
                } 
            }
        }
    };

    /**
    *  Display of Foursquare content
    */

    function showContent(last_call){
        return `<div>
        <p style="color: #B22222; font-weight:bold;
            font-size:20px; text-align:center;">
        More details about the <i>${last_call.name}:<i></p>
        <p><b>Description:</b> ${last_call.description}<br>
        <b>Home:</b> ${last_call.phone} <br>
        <b>Opening hours:</b> ${last_call.hours}<br>
        <b>More details about</b> <a target="_blank" href="${last_call.url}">${last_call.name}</a><br>
        <b>Latest shared photos by customers:</b><br>
        <img style="margin-top:10px; margin-left:20px;"
            src="${last_call.photo1}">
        <img style="margin-top:10px; margin-left:20px;"
            src="${last_call.photo2}">
        </p>
        </div>`;
    }

    /**
    *  Function that allows to control the display of all markers on the map,
    * if none of the locations is specifically selected.
    */ 

    function new_status(all_locations){
        var change_status = [];
        for(let i=0; i<all_locations.length; i++){
            if (all_locations[i].on() === false){
                change_status.push(all_locations[i].on());
            }
        }
        if (change_status.length == all_locations.length){
            markers.forEach(function(marker){
                marker.setVisible(true);
            });
        }
    }

    /**
    *  Proactive listening to the modifications of the location list and
    * change of markers on the map.
    */

    self.locations.subscribe(function(new_loc){
        // console.log('subscribe', self.locations(), new_loc);
        setMapOnAll(null);
        markers = [];
        new_loc.forEach(function(loc){
            var marker_pos = {lat:loc.lat, lng:loc.lng};
            var marker = setMarker(loc.title,marker_pos);
            marker.setMap(map);
            markers.push(marker);
            marker.addListener("click", function(){
                marker.addListener("click", toggleBounce);
                info_marker(this, infowindow);
                highlight(this.position);
                if (this.title == loc.title){
                    self.new_selected(loc);
                }
                google.maps.event.clearListeners(infowindow, 'closeclick');
                google.maps.event.addListener(infowindow,'closeclick', function(){
                    markers.forEach(function(eachMarker, index){
                        if (eachMarker.title == loc.title){
                            eachMarker.setAnimation(null);
                            eachMarker.setIcon(null);
                            eachMarker.setVisible(true);
                            self.new_selected(loc);
                        }
                    });
                });
            });
        });
    });

    /**
    *  Proactive listening to the modifications of the field allowing to filter
    * through available locations and display of markers on the map. 
    */

    self.searched_position.subscribe(function(newText){
        if (self.searched_position !== "" || self.user_keyword() !== ""){
            for(let i=0; i<self.locations().length; i++){
                if (self.locations()[i].title.toLowerCase()
                    .indexOf(self.searched_position().toLowerCase()) > -1){
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

    /**
    *  Reloads the page, if the user does not share the location.
    */ 

    backToNY = function(){
        location.reload();
    };

     /**
    *  Function that triggers actions based on
    *  whether the user shares or not his/her location.
    */

    shareLoc = function(){
        location_options_visible(false);
        New_York_visible(false);
        share_location_visible(true);
        location_details("");
        self.user_keyword.valueHasMutated();
        if (navigator.geolocation) {
            loader_visible(true);
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
            };
            var geo_marker = setMarker('You are here', pos);  // Sets the marker displaying the position of the user.
            geo_marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
            geo_marker.setMap(map);
            map.setCenter(pos);
            geo_marker.addListener('mouseover', function(){
                infowindow.setPosition(pos);
                infowindow.setContent('You are here.');
                infowindow.open(map);
            });
            loader_visible(false);
            }, function() {
            handleLocationError(true);
            });
        } else {
            handleLocationError(false);  // Browser doesn't support geolocation
        }
    };
}

function myErrorFunction(){
    alert("Google Maps has not loaded. Check your connection, query and API key.");
}

/**
*  Google Maps initiation. 
*/

function initMap() {

    map = new google.maps.Map(document.getElementById('map_container'), {
        center: {lat:40.7713024, lng:-73.9632393},
        zoom: 12,
    });
    infowindow = new google.maps.InfoWindow();
    // Create Knockout object and bind it
    var myObject = new LocationViewModel();
    ko.applyBindings(myObject);
    myObject.locations(list(locations));
    return infowindow;
}

/**
*  Function that handles the dynamic display of various parts of
* the website in case the user decides not to share his/her
* geolocation with the application. 
*/

function handleLocationError(browserHasGeolocation) {
    $('#no_geo').modal();
    location_options_visible(true);
    loader_visible(false);
}

/**
*  Sets the marker on the map 
*/

function setMarker(title, marker_pos){
    return new google.maps.Marker({
        position: marker_pos,
        title: title,
        animation: google.maps.Animation.DROP  
    });
}

/**
*  Controls the display of all markers on the map.
*/

function setMapOnAll(map) {
    for(let i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }  
}

/** 
* Allows to change the marker color and make the marker
* bounce on user's interaction with it.
*/

function toggleBounce(){
    if (this.getAnimation() !== null){
        this.setAnimation(null);
        // this.setIcon(null);
    } else {
        this.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        this.setAnimation(google.maps.Animation.BOUNCE);
    }
}

/**
*  Allows to create infowindows with location details, when
* the location on the map is clicked.
*/

function info_marker(marker, infowindow){
    var marker_position = {lat:marker.position.lat()+0.003, lng:marker.position.lng()};
    // console.log(marker_position);
    infowindow.setPosition(marker_position);
    infowindow.setContent("<div style='font-size:14px; margin-top:5px;'><b>"+marker.title+'</b><br>'+'</div>'+'<br>'+'<div id="pano"></div>'); 
    infowindow.open(map); 
}

/** 
 * Helper function that allows to display the street view of location in the infowindow.
 */

function highlight(position){
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'),{
            position: {
                lat: position.lat(),
                lng: position.lng()
            },
            pov: {
                heading: 34,
                pitch: 10
            }
        }
    );
    map.setStreetView(panorama);

}
