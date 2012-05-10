/*	CloudGenerator Class and Cloud Class
 *	Author: Tim Dupree, tdupree.com
 *	Date: 3/3/2011
 * 	Update by: Bruno Heridet, delapouite.com
 *	Date: 2012/05/10
 *	License: MIT Open Source License
	The MIT License
	
	Copyright (c) 2011 Tim Dupree
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
 */

var CloudGenerator = new Class({

	Implements: [Events, Options],
	
	// Initialize our defqult values for the class options passed in
	options: {
		totalClouds:  4,		// Total number of clouds on screen at a given time (int)
		minDuration: 10000,		// Minimum travel time for a cloud across the screen (milliseconds)
		maxDuration: 120000,	// Maximum tracel time for a cloud across the screen (milliseconds)
		checkInterval: 10000,	// The interval used to check if new clouds are needed (milliseconds)
		autoStart: true,		// Automatically starts the cloud generator by default (bool)
		sky: document.id('sky'),// Default sky target resides in an element named "sky" (element)
		cloudImgs: [{			// Add more cloud imgs following the same object pattern
			src: 'cloud.png',	// Define default cloud image (path/url)
			width: 573,			// Cloud width (px)
			height: 262			// Cloud height (px)
		}],
		cloudImg: 'cloud.png',	
		cloudDirection: 0,		// 0 random, 1 = left to right, -1 = right to left (int)	
		cloudScales: [1, 0.8, 0.6, 0.4, 0.2],	// Define an array containing the sizes the cloud will be scaled to (%)
		cloudOpacities: [1, 0.8, 0.6],			// Set to [1] to deactivate opacity variation
		maxAltitude: 600, 		// This defines the vertical space you allow clouds to appear within the sky (px)
		cloudTransition: Fx.Transitions.linear	//Define the transition algorithm for the cloud movement
	},
	
	cloudCheck: null,			// Initialize the variable to hold the setInterval declaration
	cloudsInSky: 0,				// Keep track of number of clouds in sky
	cloudSky: null,				// A reference to the cloudSky generated and injected into the sky element

	// Our constructor for the CloudGenerator class
	// It takes in the options passed to it and uses the implemented Options
	// utility class to modify any default options in our options object
	initialize: function(options){
		// Modify any defaults with the passed in options
		this.setOptions(options);
		
		// Find the largest cloud image width
		this.largestCloudWidth = 0;
		this.options.cloudImgs.forEach(function(cloudImg) {
			if (cloudImg.width > this.largestCloudWidth) {
				this.largestCloudWidth = cloudImg.width;
			}
		}.bind(this));
		// Create Cloud Sky
		this.cloudSky = new Element('div', {
			id: 'cloudSky',
			styles: {
				position: 'absolute',
				width: (this.options.sky.getDimensions().x + ( 2 * this.largestCloudWidth)),
				left: -this.largestCloudWidth
			}
		});
		
		// Place the cloud container within the sky
		// This lets us ensure that the clouds can smoothly enter and exit the 
		// boundaries of the sky element
		this.options.sky.grab(this.cloudSky);
		this.cloudDirection = this.options.cloudDirection || [-1, 1].getRandom();
		// autostat the cloud generator by default
		if(this.options.autoStart){
			this.startGenerator();
		}
	},
	
	// Check if there are less than the max number of clouds in the sky
	// If there is room, deploy another cloud, if not, do nothing
	deploy: function(){
		if(this.cloudsInSky >= this.options.totalClouds || this.cloudsFull) return;

		var cloudImg = this.options.cloudImgs.getRandom();
		var cloudScale = this.options.cloudScales.getRandom();
		var cloudDuration = Number.random(this.options.minDuration, this.options.maxDuration);
		var cloudAltitude = Math.floor(Math.random() * (this.options.maxAltitude - (cloudScale * cloudImg.height)));
		
		this.cloudsInSky++;

		new Cloud({
			width: Math.floor(cloudImg.width * cloudScale),
			height: Math.floor(cloudImg.height * cloudScale),
			altitude: cloudAltitude,
			duration: cloudDuration,
			direction: this.cloudDirection,
			src: cloudImg.src,
			transition: this.options.cloudTransition,
			opacity: this.options.cloudOpacities.getRandom(),
			generator: this,
			onComplete: function(){
				this.removeCloud();
			}.bind(this)
		});
	},
	
	// Decrement cloudsInSky variable
	removeCloud: function(){
		if(this.cloudsInSky > 0){
			this.cloudsInSky--;
		}
	},
	
	// Stop the cloudGenerator
	stopGenerator: function(){
		clearInterval(this.cloudCheck);
	},
	
	// Start the cloudGenerator
	startGenerator: function(){
		this.deploy();
		this.cloudCheck = this.deploy.periodical(this.options.checkInterval, this);
	}
});


var Cloud = new Class({
	// Implement the Events and Options utility classes
	Implements: [Events, Options],
	
	id: '',	// hold a reference to this cloud's DOM id property
	
	options: {
		duration: 4000,			// Duration of the clouds movement across the sky (milliseconds)
		direction: 1,			// Direction of the clouds movement, 1 = left to right and -1 vice versa
		altitude: 200,			// Altitude of the cloud in the sky
		width: 573,				// Width of the cloud (px)
		height: 262,			// Height of the cloud (px)
		src: 'cloud.png',		// Cloud image (path/url)
		transition: Fx.Transitions.linear,	//Define the transition algorithm for the cloud movement
		opacity: 1,
		generator: null
	},
	
	initialize: function(options){
		// modify any defaults with the passed in options
		this.setOptions(options);
		this.id = 'cloud-' + (new Date().getTime());
		
		// determine if cloud will be moving left to right or right to left
		// the position cloud offscreen to begin movement
		var style = { 
			position: 'absolute',
			top: this.options.altitude,
			width: this.options.width,
			height: this.options.height,
			opacity: this.options.opacity
		};
		var skyPosition = 'upperRight'; // Move the cloud to the right, ignore the 'upper'
		var edge = 'upperLeft';	// Align the edge of the cloud to the left edge of the sky
		var xOffset = this.options.generator.largestCloudWidth - this.options.width;
		// Determine the direction of the cloud and set styles and positions
		if(this.options.direction === 1){
			style.left = xOffset;
		}
		else {
			style.right = xOffset;
			skyPosition = 'upperLeft';
			edge = 'upperRight';
			xOffset *= -1;
			
		}
		// Create the image element for the cloud
		var cloud = new Element('img', {
			id: this.id,
			src: this.options.src,
			styles: style
		});
		
		// Add the cloud image element to the cloudSky div
		this.options.generator.cloudSky.grab(cloud);
		
		// Move the cloud across the sky
		new Fx.Move(cloud, {
			relativeTo: this.options.generator.cloudSky,
			position: skyPosition,
			edge: edge,
			offset: {x: xOffset, y: this.options.altitude}, 
			duration: this.options.duration,
			transition: this.options.transition,
			onComplete: function(){
				this.complete();
			}.bind(this)
		}).start();
	},
	
	complete: function(){
		document.id(this.id).destroy();
		// this is picked up by the cloudGenerator class
		this.fireEvent('complete');	
	}
});