// Implementation of the Foursquare API. The first function allows to retrieve
// the list of places with their names, addresses and location coordinates
// that correspond to the user query and are in the vicity of user location.

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
        .then(function (response) {
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
                    id: i.venue.id,
                });
            })
            self.locations(list(list_of_recs));
        })
        .catch(function (error) {
            console.log(error);
        });
    }

// Allows to retrieve detailed information about a particular venue.

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
            selected_place = response.data.response.venue;
            place = {
                phone: selected_place.contact.phone || "Phone not available",
                hours: selected_place.hours ? selected_place.hours.status  :
                    "Hours not available",
                description: selected_place.description ||
                    "Description not available",
                photo1: "https://igx.4sqi.net/img/general/200x200"+
                    selected_place.photos.groups[0].items[0].suffix ||
                        "Currently not available",
                photo2: "https://igx.4sqi.net/img/general/200x200"+
                    selected_place.photos.groups[0].items[1].suffix ||
                        "Currently not available"
            };
            var content = `<div>
                <p style="color: #B22222; font-weight:bold;
                    font-size:20px; text-align:center;">
                More details about the <i>${selected_place.name}:<i></p>
                <p><b>Description:</b> ${place.description}<br>
                <b>Home:</b> ${place.phone} <br>
                <b>Opening hours:</b> ${place.hours}<br>
                <b>Latest shared photos by customers:</b><br>
                <img style="margin-top:10px; margin-left:20px;"
                    src="${place.photo1}">
                <img style="margin-top:10px; margin-left:20px;"
                    src="${place.photo2}">
                </p>
            </div>`;
            document.getElementById("location_details").innerHTML = content;
        })
        .catch(function (error) {
            console.log(error);
        });

}