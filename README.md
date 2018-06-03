# Restaurant Project Description
This is a simple one-page application that allows the users to dynamically search for and filter the places of interest in their vicinity with the possibility to locate these places on the map and view more detailed information about these places (their opening hours/contact information/latest customer photos).  

## Directory Structure
In this Github repository you will find the following documents:

1. *neighborhood.html* – contains the code necessary for the display of the page as well as Google maps API integration
2. *foursquare.js* –  contains the code related to Foursquare API integration
3. *neighborhood.js* – contains the list and data of default locations that are used by the application before the user shares his/her location as well as all the logic related to the dynamic management of user inputs
4. *knockout.3.4.2* – is an installation package necessary for the use of Knockout.js in the project
5. *images* folder –  contains all the images that are required for the application
6. *styles* folder – contains all the styles
7. *credentials.js* –  please insert Foursquare API keys and credentials in respective fields in the file

## Requirements
In order to test the application, you will need to get Google Maps and Foursquare API keys. In order to do that, please create developer accounts for both platforms.
- If you do not have a Google account yet, please follow the instructions below: `https://cloud.google.com/maps-platform/maps/`
Activate Google Map API in the developer console.
- Please follow the following instructions to open a Foursquare developer account: `https://foursquare.com/developers/login?continue=%2Fdevelopers%2Fapps` (If you open a Sandbox account, you will be able to preview only 1 customer photo per selected location, if you decide to upgrade the account to Personal, then 2 customer photos will be visible in the “More details about” section.)

## Installation
1. Clone the Github repository to your local machine
```
git clone https://github.com/MissT17/neighbourhood.git
```

2. Create *credentials.js* file
```
//Credentials and API keys for Foursquare API activation

credentials = {
     client_id: 'YOUR API Key',
     client_secret: 'YOUR FOURSQUARE SECRET'
}
```
insert your respective keys and credentials in the pre-defined fields and “Save” the file.

3. Open *neighborhood.html* file in the browser and start navigation.

## Expected Outcome
The application allows the users to acquire additional information about the places of interest and consists of two steps:
1. On load the user will see a list of suggested places in New York and can filter them to check if one of his/her favourite places is in the suggested list by typing in the first letters of the place in the input field. All places are indicated on the map with a red pin.
⋅⋅*On click on a location in the list, the user will be provided with the location pin on the map, all additional pins will not be displayed.
⋅⋅*On click of the pin, the pin will change its color and will start bouncing. In addition to that an info window related to the pin will appear on the screen providing the user with the Street View image of the location. If the info window is closed, the pin will change to its original color and will stop bouncing.
2. If the user decides to share his/her location, the user will see only one yellow pin indicating his/her location.
⋅⋅*If the user indicates the type of place he/she is looking for in the first field, the list of recommendations will be populated with the list of closest locations that correspond to user’s request. The list will be dynamically modified every time the user modifies the search criteria (ex. adds/deletes a letter in the request, changes the request, etc.)
⋅⋅*The user can filter the locations to see if the place he/she had in mind is present in the list by typing in the first letters of the place in the second field. The list of recommendations will be reduced based on the user request.
⋅⋅*On click of a location in the list, some additional information from Foursquare about the place (ex. opening hours, contact information, photos, etc.) will be displayed on the screen under the list. The rest of behavior (pin, info window, etc.) will be similar to the application behaviour with the default list of locations.

Note: If the user clicks on button “Share location” and then does not allow the browser to use his/her geolocation or if the geolocation is not activated, a pop-up window will appear informing the user about the error. The user will then see two options to go back to the page with New York default locations or share his/her location. 

## License:
All the information related to locations (ex. opening hours, customer photos, contact information, etc.) is provided by Foursquare.
