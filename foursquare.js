'use strict';
var place;


/**
* Implementation of the Foursquare API. The first function allows to retrieve
* the list of places with their names, addresses and location coordinates
* that correspond to the user query and are in the vicity of user location. 
*/

function foursquare(self, pos, query, limit){
    axios
        .get("https://api.foursquare.com/v2/venues/explore", {
            params: {
                client_id: credentials.client_id,
                client_secret: credentials.client_secret,
                v: "20180323",
                ll: pos.lat+","+pos.lng,
                query: query,
                limit: limit,
                radius: 1000
            }
        })
        .then(function(response) {
            var recommendations = response.data.response.groups[0].items;
            var list_of_recs = [];
            recommendations.forEach(function(i){
                list_of_recs.push({
                    title: i.venue.name,
                    location: {
                        lat: i.venue.location.lat,
                        lng: i.venue.location.lng,
                    },
                    address: i.venue.location.address,
                    id: i.venue.id
                });
            });
            self.locations(list(list_of_recs));
        })
        .catch(function(error) {
            console.log(error);
            alert("Foursquare API did not load correctly, please check your API keys.");
        });
    }

/**
*  Allows to retrieve detailed information about
* a particular venue and display it in the browser.
*/

var list_foursquare = [];
function foursquare_details(id){
    axios
        .get("https://api.foursquare.com/v2/venues/"+ id, {
            params: {
                client_id: credentials.client_id,
                client_secret: credentials.client_secret,
                v: "20180323"
            }
        })
        .then(function(response){
            var selected_place = response.data.response.venue;
            place = {
                name : selected_place.name,
                phone: selected_place.contact.phone || "Phone not available",
                hours: selected_place.hours ? selected_place.hours.status  :
                    "Hours not available",
                description: selected_place.description ||
                    "Description not available",
                url: selected_place.canonicalUrl 
                };

            if (selected_place.photos.groups.length === 0){
                place.photo1 = "images/no_pic.png";
                place.photo2 = "images/no_pic.png";
            } else if (selected_place.photos.groups[0].items.length >1){
                place.photo1 = "https://igx.4sqi.net/img/general/200x200"+
                    selected_place.photos.groups[0].items[0].suffix;
                place.photo2 = "https://igx.4sqi.net/img/general/200x200"+
                    selected_place.photos.groups[0].items[1].suffix;
            } else if (selected_place.photos.groups[0].items.length === 1) {
                    place.photo1 = "https://igx.4sqi.net/img/general/200x200"+
                    selected_place.photos.groups[0].items[0].suffix;
                    place.photo2 = "images/no_pic.png";
            } else {
                    place.photo1 = "images/no_pic.png";
                    place.photo2 = "images/no_pic.png";
            }

            var checked = 0;
            if (list_foursquare.length === 0){
                list_foursquare.push(place);
                // console.log('if 0', list_foursquare);
            } else {
                list_foursquare.forEach(function(item){
                    if (item.name != place.name){
                        checked = checked + 1;
                    }
            if (checked == list_foursquare.length){
                list_foursquare.push(place);
                // console.log('if more', list_foursquare);
                var last_call = list_foursquare.slice(-1);
                }
            });
            }
            var last_call = list_foursquare.slice(-1);
            location_details(`<div>
                <p style="color: #B22222; font-weight:bold;
                    font-size:20px; text-align:center;">
                More details about the <i>${last_call[0].name}:<i></p>
                <p><b>Description:</b> ${last_call[0].description}<br>
                <b>Home:</b> ${last_call[0].phone} <br>
                <b>Opening hours:</b> ${last_call[0].hours}<br>
                <b>More details about</b> <a target="_blank" href="${last_call[0].url}">${last_call[0].name}</a><br>
                <b>Latest shared photos by customers:</b><br>
                <img style="margin-top:10px; margin-left:20px;"
                    src="${last_call[0].photo1}">
                <img style="margin-top:10px; margin-left:20px;"
                    src="${last_call[0].photo2}">
                </p>
                </div>`);
        })
        .catch(function (error) {
            console.log(error);
            // console.log('list_foursquare', selected_place);
            alert("Foursquare API did not load correctly, please check your API keys.");
        });

}