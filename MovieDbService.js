var HttpService = require("droopy-http"),
	format = require("util").format,
	q = require("q");

var MovieDbService = function (apiKey) {
	this.baseUrl = "http://api.themoviedb.org/3";
	this.apiKey = apiKey;
};

MovieDbService.prototype = new HttpService();

MovieDbService.prototype.search = function(searchText) {
	var url = format("%s/search/movie?query=%s&api_key=%s", this.baseUrl, searchText, this.apiKey);
	return this.getJSON(url);
};

MovieDbService.prototype.searchForOne = function(searchText) {
	var deferred = q.defer(),
		self = this;
	this.search(searchText).then(function(response){
		if (response.results.length > 0 ) {
			self.getFullMovie(response.results[0].id).then(deferred.resolve);
		} else {
			deferred.reject("NO RESULTS!! - " + searchText);
		}
	}).fail(deferred.reject);

	return deferred.promise;

};

MovieDbService.prototype.getFullMovie = function(id) {
	var appendToResponse = "append_to_response=casts,keywords,trailers,releases";
	var url = format("%s/movie/%s?api_key=%s&%s", this.baseUrl, id, this.apiKey, appendToResponse);
	return this.getJSON(url);
};

MovieDbService.prototype.getPerson = function(id) {
	var appendToResponse = "append_to_response=credits";
	var url = format("%s/person/%s?api_key=%s&%s", this.baseUrl, id, this.apiKey, appendToResponse);
	console.log(url);
	return this.getJSON(url);
};

module.exports = MovieDbService;