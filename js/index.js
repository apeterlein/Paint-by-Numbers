$(document).ready(function () {
	"use strict";
	var img;
	var width, height, start;
	
	var squares;
	
	var c = document.getElementById("working-image");
	var ctx = c.getContext("2d");
	
	c.height = window.innerHeight * 0.6;
	c.width = window.innerWidth * 0.8;
	
	window.addEventListener("resize", function () {
		c.height = window.innerHeight * 0.6;
		c.width = window.innerWidth * 0.8;
		if (img.onload) {
			img.onload();
		}
	});
	
	$(".image").hide();
	$(".loading").hide();
	$("#save").css('visibility', 'hidden');
	
	$("html").on("dragover", function() {
		event.preventDefault();  
    	event.stopPropagation();
		$(".drop-icon").removeClass("bounce")
			.html("check");
	});

	$("html").on("dragleave", function() {
		event.preventDefault();  
    	event.stopPropagation();
		$(".drop-icon").addClass("bounce")
			.html("arrow_downward");
	});

	$("html").on("drop", function(event) {
		event.preventDefault();  
		event.stopPropagation();
		$(".drop-icon").hide();
		$(".image").show();
		var file = event.originalEvent.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			  img = new Image();
			  img.onload = function() {
				  var rat = img.width / img.height;
				  if (c.width / c.height > rat) {
					  height = c.height;
					  width = height * rat;
					  start = (c.width - width) / 2;
				  }
				  else {
					  start = 0;
					  width = c.width;
					  height = width / rat;
				  }
				  ctx.drawImage(img, start, 0, width, height);
				  if (squares) {
					  drawsquares();
				  }
				  drawlines();
			  };
			  img.src = e.target.result;
		};
		reader.readAsDataURL(file);
		$(".starting").html(file.name);
	});
	
	$("#start").click(function () {
        $(".input-group").css('visibility', 'hidden');
		$("#start").css('visibility', 'hidden');
		$("#save").css('visibility', 'visible');
		$("#start").off("click");
		$(".loading").show();
		
	  	ctx.drawImage(img, start, 0, width, height);
		
		var hor = parseInt($("#horz").val());
		var ver = parseInt($("#vert").val());
		var colors = parseInt($("#colors").val());
		
		squares = [];
		
		for (var i = 0; i < ver; i++) {
			squares.push([]);
			for (var j = 0; j < hor; j++) {
				squares[i].push([]);
				var data = ctx.getImageData(start + i * (width / ver), j * (height / hor), width / ver, height / hor).data;
				var avg_r = 0;
				var avg_g = 0;
				var avg_b = 0;
				for (var k = 0; k < data.length; k += 4) {
					var opac = data[k+3] / 255;
					avg_r += opac * data[k];
					avg_g += opac * data[k+1];
					avg_b += opac * data[k+2];
				}
				avg_r /= data.length / 4;
				avg_g /= data.length / 4;
				avg_b /= data.length / 4;
				
				squares[i][j].push(avg_r);
				squares[i][j].push(avg_g);
				squares[i][j].push(avg_b);
			}
		}
		
		var unique = numberUnique();
		while (unique.length > colors) {
			var first = [0,0,0];
			var second = [0,0,0];
			var distance = null;
			for(var ii = 0; ii < unique.length - 1; ii++) {
				for(var jj = ii + 1; jj < unique.length; jj++) {
					var dist = (unique[ii][0] - unique[jj][0])**2 + (unique[ii][1] - unique[jj][1])**2 + (unique[ii][2] - unique[jj][2])**2;
					if (!distance || distance > dist) {
						first = unique[ii];
						second = unique[jj];
						distance = dist;
					}
				}
			}
			var ncol = [(first[0] + second[0]) / 2, (first[1] + second[1]) / 2, (first[2] + second[2]) / 2];
			for (var iii = 0; iii < squares.length; iii++) {
				var ind = squares[iii].indexOf(first);
				while (ind !== -1) {
					squares[iii][ind] = ncol;
					ind = squares[iii].indexOf(first);
				}
				ind = squares[iii].indexOf(second);
				while (ind !== -1) {
					squares[iii][ind] = ncol;
					ind = squares[iii].indexOf(second);
				}
			}
			unique = numberUnique();
		}
		
		drawsquares();
		drawlines();
		drawnumbers();
		$(".loading").hide();
	});
	
	$("#reset").click(window.location.reload.bind(window.location));
	
	$("#save").click(function () {
		var temp = document.createElement("canvas");
		temp.width = width;
		temp.height = height;
		var tctx = temp.getContext("2d");
		var timg = ctx.getImageData(start, 0, width, height);
		tctx.putImageData(timg,0,0);
		temp.toBlob(function(blob) {
    		saveAs(blob, "paint.png");
			window.location.reload();
		});
	});
	
	var drawsquares = function() {
		var hor = parseInt($("#horz").val());
		var ver = parseInt($("#vert").val());
		
		for (var i = 0; i < ver; i++) {
			for (var j = 0; j < hor; j++) {
				ctx.fillStyle = "#" + rgbToHex(squares[i][j][0]) + rgbToHex(squares[i][j][1]) + rgbToHex(squares[i][j][2]);
				ctx.fillRect(start + i * (width / ver), j * (height / hor), width / ver, height / hor);
			}
		}
	};
	
	var drawnumbers = function() {
		var hor = parseInt($("#horz").val());
		var ver = parseInt($("#vert").val());
		var unique = numberUnique();
		
		for (var i = 0; i < ver; i++) {
			for (var j = 0; j < hor; j++) {
				ctx.textAlign = "center";
				ctx.font = "20px Arial"; 
				ctx.fillStyle = "#000000";
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 1;
				ctx.strokeText(unique.indexOf(squares[i][j]),start + (i + 0.5) * (width / ver), (j+ 0.8) * (height / hor));
				ctx.fillText(unique.indexOf(squares[i][j]),start + (i + 0.5) * (width / ver), (j+ 0.8) * (height / hor));
			}
		}
	};
	
	var drawlines = function() {
		var hor = parseInt($("#horz").val());
		var ver = parseInt($("#vert").val());
		
		for (var pos = 0; pos <= ver; pos++) {
			ctx.beginPath();
			ctx.moveTo(pos*(width / ver) + start, 0);
			ctx.lineTo(pos*(width / ver) + start, height);
			ctx.lineWidth = 2;
      		ctx.strokeStyle = '#ff0000';
			ctx.stroke();
		}
		
		for (pos = 0; pos <= hor; pos++) {
			ctx.beginPath();
			ctx.moveTo(start, pos*(height / hor));
			ctx.lineTo(start + width, pos*(height / hor));
			ctx.lineWidth = 2;
      		ctx.strokeStyle = '#ff0000';
			ctx.stroke();
		}
		
		$("#horz").off("change");
		$("#vert").off("change");
		$("#horz").change(img.onload);
		$("#vert").change(img.onload);
	};
	
	var rgbToHex = function (rgb) { 
		var hex = parseInt(rgb).toString(16);
		if (hex.length < 2) {
			hex = "0" + hex;
		}
		return hex;
	};
	
	var numberUnique = function () {
		var unique = [];
		for (var i = 0; i < squares.length; i++) {
			for (var j = 0; j < squares[i].length; j++) {
				var data = squares[i][j];
				var found = unique.find(function (elem) {
					return elem[0] === data[0] && elem[1] === data[1] && elem[2] === data[2];
				});
				if (!found) {
					unique.push(data);
				}
			}
		}
		return unique;
	};
});