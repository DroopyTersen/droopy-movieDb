var HttpService = require("droopy-http"),
	format = require("util").format,
	q = require("q");

var MovieDbService = function(apiKey) {
	this.baseUrl = "http://api.themoviedb.org/3";
	this.apiKey = apiKey;
};

MovieDbService.prototype = new HttpService();

MovieDbService.prototype.search = function(searchText) {
	var url = format("%s/search/movie?query=%s&api_key=%s", this.baseUrl, searchText, this.apiKey);
	return this.getJSON(url);
};

MovieDbService.prototype.searchForOne = function(searchText) {
	var self = this;
	return this.search(searchText)
		.then(function(response) {
			if (response.results.length > 0) {
				return self.getFullMovie(response.results[0].id);
			} else {
				throw new Error("NO RESULTS!! - " + searchText);
			}
		});
};

MovieDbService.prototype.getFullMovie = function(id) {
	var appendToResponse = "append_to_response=casts,keywords,trailers,releases";
	var url = format("%s/movie/%s?api_key=%s&%s", this.baseUrl, id, this.apiKey, appendToResponse);
	return this.getJSON(url)
		.then(function(movie) {
			movie.casts.cast.sort(function(a, b) {
				return a.order <= b.order ? -1 : 1;
			});
			var usReleases = movie.releases.countries.filter(function(country) {
				return country.iso_3166_1 === "US";
			});
			movie.mpaa = usReleases.length > 0 ? usReleases[0].certification : "NR";
			return movie;
		});
};

MovieDbService.prototype.getPerson = function(id) {
	var appendToResponse = "append_to_response=credits";
	var url = format("%s/person/%s?api_key=%s&%s", this.baseUrl, id, this.apiKey, appendToResponse);
	return this.getJSON(url);
};

module.exports = MovieDbService;