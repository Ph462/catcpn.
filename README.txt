CAT PHOENIX — CINEMA & MUSIC V3

This version adds a fuller entertainment homepage:
- Trending TV/series discoveries (TVmaze search catalogue)
- Latest movie discoveries from Internet Archive's public movie collection
- K-drama collection search shortcuts
- Action and adventure series discoveries
- Music album discovery via Apple's iTunes Search API
- Global search for movies, series and music
- Responsive mobile navigation and polished cards/tiles

RUN
1. Download and extract the ZIP.
2. Open the folder in Acode or VS Code.
3. Open index.html in a modern browser, preferably through a local web server.
4. Keep an internet connection active: the live catalogue sections use public APIs.

NOTES
- The "Trending" and "Action" areas are discovery shelves built from selected catalogue searches, not official real-time popularity rankings.
- The K-drama shelf uses title searches for selected Korean series. You can search any title in the search bar.
- Latest movie discoveries are sorted by Internet Archive public date; this does not necessarily mean recent cinema releases.
- The website does not host media. Internet Archive item rights vary; check item details before downloading or reusing. Music catalogue links/previews are provided by Apple. TV metadata is provided by TVmaze.
- API availability and browser cross-origin rules can affect live results.

FILES
index.html — full homepage sections
style.css — design and responsive layout
app.js — live catalogue/search logic
