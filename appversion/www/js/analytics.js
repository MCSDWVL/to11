"use strict";

//------------------------------------------------------------------------------
function Analytics(uid, sitename)
{
	this.uid = uid;
	this.sitename = sitename;
	this.enabled = window.location.protocol == 'https:' || window.location.protocol == 'http:';
	console.log("Enabled: " + this.enabled + " " + window.location.protocol);
	this.initGoogleAnalytics();
};

//------------------------------------------------------------------------------
Analytics.prototype.initGoogleAnalytics = function()
{
	if(!this.enabled)
		return;
		
	(function (i, s, o, g, r, a, m)
	{
		i['GoogleAnalyticsObject'] = r; 
		i[r] = i[r] || function () {(i[r].q = i[r].q || []).push(arguments)}, i[r].l = 1 * new Date();
		a = s.createElement(o), m = s.getElementsByTagName(o)[0]; 
		a.async = 1; 
		a.src = g; 
		m.parentNode.insertBefore(a, m)
	})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

	ga('create', this.uid, this.sitename);
	ga('send', 'pageview');
};

//------------------------------------------------------------------------------
Analytics.prototype.trackEvent = function(category, action, label, value)
{
	if(!this.enabled || !ga)
		return;

	console.log("tracking event send, category: " + category + ", action: " + action + ", label: " + label + ", value: " + value);
	
	ga('send', 'event', category, action, label, value);
};

//------------------------------------------------------------------------------
Analytics.prototype.returnToMenu = function()
{	
	this.trackEvent("navigation", "menu");
};

//------------------------------------------------------------------------------
Analytics.prototype.boardStart = function(levelNumOrSeed, isRandom, howLoaded)
{	
	this.trackEvent("level", "start", (isRandom ? "Random" : "Level")+levelNumOrSeed + " Start - " + howLoaded);
};

//------------------------------------------------------------------------------
Analytics.prototype.levelScore = function(levelNumOrSeed, isRandom, medalLevel, score)
{	
	this.trackEvent("level", "complete", (isRandom ? "Random" : "Level")+levelNumOrSeed + " - " + ["none","bronze","silver","gold","super"][medalLevel], score);
};

//------------------------------------------------------------------------------
Analytics.prototype.levelLost = function(levelNumOrSeed, isRandom)
{
	this.trackEvent("level", "lost", (isRandom ? "Random" : "Level")+levelNumOrSeed);
};


