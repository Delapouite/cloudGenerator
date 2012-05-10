/*	CloudGenerator Class and Cloud Class
 *	Author: Tim Dupree, tdupree.com
 *	Date: 3/3/2011
 *	Update by: Bruno Heridet, delapouite.com
 *  Date: 2012/05/10
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
 */var CloudGenerator=new Class({Implements:[Events,Options],options:{totalClouds:4,minDuration:1e4,maxDuration:12e4,checkInterval:1e4,autoStart:!0,sky:document.id("sky"),cloudImgs:[{src:"cloud.png",width:573,height:262}],cloudImg:"cloud.png",cloudDirection:0,cloudScales:[1,.8,.6,.4,.2],cloudOpacities:[1,.8,.6],maxAltitude:600,cloudTransition:Fx.Transitions.linear},cloudCheck:null,cloudsInSky:0,cloudSky:null,initialize:function(a){this.setOptions(a),this.largestCloudWidth=0,this.options.cloudImgs.forEach(function(a){a.width>this.largestCloudWidth&&(this.largestCloudWidth=a.width)}.bind(this)),this.cloudSky=new Element("div",{id:"cloudSky",styles:{position:"absolute",width:this.options.sky.getDimensions().x+2*this.largestCloudWidth,left:-this.largestCloudWidth}}),this.options.sky.grab(this.cloudSky),this.cloudDirection=this.options.cloudDirection||[-1,1].getRandom(),this.options.autoStart&&this.startGenerator()},deploy:function(){if(this.cloudsInSky>=this.options.totalClouds||this.cloudsFull)return;var a=this.options.cloudImgs.getRandom(),b=this.options.cloudScales.getRandom(),c=Number.random(this.options.minDuration,this.options.maxDuration),d=Math.floor(Math.random()*(this.options.maxAltitude-b*a.height));this.cloudsInSky++,new Cloud({width:Math.floor(a.width*b),height:Math.floor(a.height*b),altitude:d,duration:c,direction:this.cloudDirection,src:a.src,transition:this.options.cloudTransition,opacity:this.options.cloudOpacities.getRandom(),generator:this,onComplete:function(){this.removeCloud()}.bind(this)})},removeCloud:function(){this.cloudsInSky>0&&this.cloudsInSky--},stopGenerator:function(){clearInterval(this.cloudCheck)},startGenerator:function(){this.deploy(),this.cloudCheck=this.deploy.periodical(this.options.checkInterval,this)}}),Cloud=new Class({Implements:[Events,Options],id:"",options:{duration:4e3,direction:1,altitude:200,width:573,height:262,src:"cloud.png",transition:Fx.Transitions.linear,opacity:1,generator:null},initialize:function(a){this.setOptions(a),this.id="cloud-"+(new Date).getTime();var b={position:"absolute",top:this.options.altitude,width:this.options.width,height:this.options.height,opacity:this.options.opacity},c="upperRight",d="upperLeft",e=this.options.generator.largestCloudWidth-this.options.width;this.options.direction===1?b.left=e:(b.right=e,c="upperLeft",d="upperRight",e*=-1);var f=new Element("img",{id:this.id,src:this.options.src,styles:b});this.options.generator.cloudSky.grab(f),(new Fx.Move(f,{relativeTo:this.options.generator.cloudSky,position:c,edge:d,offset:{x:e,y:this.options.altitude},duration:this.options.duration,transition:this.options.transition,onComplete:function(){this.complete()}.bind(this)})).start()},complete:function(){document.id(this.id).destroy(),this.fireEvent("complete")}});