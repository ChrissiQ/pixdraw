/*
Copyright (c) 2011, Yubo Dong @ www.jswidget.com
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the jswidget.com nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,  BUT NOT LIMITED TO,  THE 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS  FOR A PARTICULAR PURPOSE 
ARE DISCLAIMED. IN  NO  EVENT  SHALL  JSWIDGET.COM BE LIABLE FOR ANY DIRECT, 
INDIRECT,   INCIDENTAL,   SPECIAL,  EXEMPLARY,  OR  CONSEQUENTIAL   DAMAGES 
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND 
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR  TORT 
(INCLUDING  NEGLIGENCE  OR  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var COLOR_SPACE = {};
COLOR_SPACE.getWebSafeColor = function(color){
   var rMod = color.r % 51;
   var gMod = color.g % 51;
   var bMod = color.b % 51;

   if((rMod==0) && (gMod==0) && (bMod==0)) return color;

   var wsColor={};

   wsColor.r=(rMod<=25?Math.floor(color.r/51)*51:Math.ceil(color.r/51)*51);
   wsColor.g=(gMod<=25?Math.floor(color.g/51)*51:Math.ceil(color.g/51)*51);
   wsColor.b=(bMod<=25?Math.floor(color.b/51)*51:Math.ceil(color.b/51)*51);

   return wsColor;
};
COLOR_SPACE.rgb2hsv = function(){
   var r, g, b, h, s, v, min, delta;
   if ( arguments.length === 1 ){
      r = arguments[0].r;
      g = arguments[0].g;
      b = arguments[0].b;
   }else{
      r = arguments[0];g = arguments[1];b = arguments[2];
   }
   
   if (r > g){
      v = Math.max(r, b);
      min = Math.min(g, b);
   }else{
      v = Math.max(g, b);
      min = Math.min(r, b);
   }

   delta = v - min;

   if (v == 0.0){
      s = 0.0;
   }else{
      s = delta / v;
   }

   if (s == 0.0){
      h = 0.0;
   }else{
      if (r == v){
         h = 60.0 * (g - b) / delta;
      }else if (g == v){
         h = 120 + 60.0 * (b - r) / delta;
      }else{
         h = 240 + 60.0 * (r - g) / delta;
      }
      
      if (h < 0.0)  { h += 360.0; }

      if (h > 360.0){ h -= 360.0; }
   }

   h = Math.round (h);
   s = Math.round (s * 255.0);
   v = Math.round (v);

   /* avoid the ambiguity of returning different values for the same color */
   if (h == 360){h = 0;}
   return {h:h,s:s,v:v};
};

COLOR_SPACE.hsv2rgb = function() {
   if ( arguments.length === 1 ){
      hue = arguments[0].h;
      saturation = arguments[0].s;
      value = arguments[0].v;
   }else{
      hue = arguments[0]; saturation = arguments[1]; value = arguments[2];
   }

   var h, s, v, h_temp;
   var f, p, q, t;
   var i;

   if ( saturation === 0 ){
      hue        = value;
      saturation = value;
      value      = value;
   }else{
      h = hue;
      s = saturation / 255.0;
      v = value      / 255.0;

      if (h == 360){
        h_temp = 0;
      }else{
        h_temp = h / 60;
      }
      i = Math.floor (h_temp);
      f = h_temp - i;
      /*
      p = v * (1.0 - s);
      q = v * (1.0 - (s * f));
      t = v * (1.0 - (s * (1.0 - f)));
      */
      vs = v * s;
      p  = value - value * s;

      switch (i){
        case 0:
          t  = v - vs * (1-f);
          hue        = Math.round (value);
          saturation = Math.round (t * 255.0);
          value      = Math.round (p);
          break;

        case 1:
          q  = v - vs * f;
          hue        = Math.round (q * 255.0);
          saturation = Math.round (value);
          value      = Math.round (p);
          break;

        case 2:
          t  = v - vs * (1-f);
          hue        = Math.round (p);
          saturation = Math.round (value);
          value      = Math.round (t * 255.0);
          break;

        case 3:
          q  = v - vs * f;
          hue        = Math.round (p);
          saturation = Math.round (q * 255.0);
          value      = Math.round (value);
          break;

        case 4:
          t  = v - vs * (1-f);
          hue        = Math.round (t * 255.0);
          saturation = Math.round (p);
          value      = Math.round (value);
          break;

        case 5:
          q  = v - vs * f;
          hue        = Math.round (value);
          saturation = Math.round (p);
          value      = Math.round (q * 255.0);
          break;
      }
   }
   return {r:hue,g:saturation,b:value};
};
COLOR_SPACE.RGB2HEX = function(rgb){
   function hex(c){
      c=parseInt(c).toString(16);
      return c.length<2?"0"+c:c;
   }
   return ("#" + hex(rgb.r) + hex(rgb.g) + hex(rgb.b)).toUpperCase();
};
COLOR_SPACE.parseColor = function(colorText){
   var sType = typeof(colorText);
   if (sType == "string"){
      if(/^\#?[0-9A-F]{6}$/i.test(colorText)){
	      return {
		            r: eval('0x'+colorText.substr(colorText.length==6?0:1, 2)),
		            g: eval('0x'+colorText.substr(colorText.length==6?2:3, 2)),
		            b: eval('0x'+colorText.substr(colorText.length==6?4:5, 2)),
		            a: 255
	            };
      }
   }else if ( sType == "object" ){
      if ( colorText.hasOwnProperty("r") &&  
           colorText.hasOwnProperty("g") && 
           colorText.hasOwnProperty("b") ){
         return colorText;
      }           
   }
   return null;
};

function ColorCanvas(canvas,hueBar){
   this.newImage = true;
   this.maxX     = 255;
   this.maxY     = 255;
   
   this.selX     = 128; /* value range 0 - 255 */
   this.selY     = 128; /* value range 0 - 255 */
   this.selZ     = 1.0; 
   
   this.hueBar      = hueBar;
   this.image       = canvas; //canvas
   this.ImageData   = null;
   this.paint();
}

ColorCanvas.prototype.paint = function(){
   var w = this.image.width, h = this.image.height;
   if ( w == 0 || h == 0 ){
      return;
   }
   
   var x = Math.round(( this.selX * w ) / this.maxX);
   var y = Math.round(( this.selY * h ) / this.maxY);
   
   if ( this.newImage || !this.image ){
      this.makeImage(this.selZ,w,h);
   }
   var ctx = this.image.getContext("2d");
   ctx.putImageData(this.ImageData,0,0);
   
   var color = this.getColor();
   var l = color.r * 0.3 + color.g * 0.59 + color.b *0.114;
   if ( this.drawPointer ){
      this.drawPointer(ctx,w,h,x,y,l);
   }else{
      this.drawDefaultPointer(ctx,w,h,x,y,l);
   }
};

ColorCanvas.prototype.drawDefaultPointer = function(ctx,w,h,x,y,l,isHueBar){
   ctx.beginPath();
   ctx.lineWidth = 1;
   if ( l < 128 ){
      ctx.strokeStyle = "rgb(255,255,255)";
   }else{
      ctx.strokeStyle = "rgb(0,0,0)";
   }
   var radius = 6;
   ctx.arc(x+0.5,y+0.5,radius,0,Math.PI * 2,true);
   
   radius += 2;
   ctx.moveTo(x-radius+0.5,y+0.5); ctx.lineTo(x+radius+0.5,y+0.5);
   ctx.moveTo(x+0.5,y-radius+0.5); ctx.lineTo(x+0.5,y+radius+0.5);
   ctx.stroke();
};

ColorCanvas.prototype.makeImage = function(b,w,h){
   if ( !this.image ){
      this.image = document.createElement("canvas");
      this.image.width  = w;
      this.image.height = h;
   }
   
   var imgData;
   if ( this.hueBar ){
      imgData = this._makeHueMap(b,w,h);
   }else{
      imgData = this._makeColorMap(b,w,h);
   }
   
   this.newImage = false;
   this.image.getContext("2d").putImageData(imgData,0,0);
   this.ImageData = imgData;
};

ColorCanvas.prototype._makeColorMap = function(b,w,h){
   var imgData = this.image.getContext("2d").getImageData(0,0,w,h);
   
   var index = 0;
   var hue = 0.0;
   var sat = 0.0;
   var bri = 0.0;
   hue = (b - Math.floor(b)) * 360;
   
   var x,y;
   for ( y = 0; y < h; y++ ){
      bri = 1 - y / h;
      for(x = 0; x < w; x++){
         sat = x / w;
         var rgb = COLOR_SPACE.hsv2rgb(hue, sat * 255, bri * 255);
         //rgb = COLOR_SPACE.getWebSafeColor(rgb);
         imgData.data[index++]  = rgb.r;
         imgData.data[index++]  = rgb.g;
         imgData.data[index++]  = rgb.b;
         imgData.data[index++]  = 255;
         
      }
   }
   return imgData;
};

ColorCanvas.prototype._makeHueMap = function(b,w,h){
   var imgData = this.image.getContext("2d").getImageData(0,0,w,h);
   
   var index = 0;
   var hue = 0.0;
   var sat = 1;

   var x,y;    
   for(y = h-1; y >=0; y--){
      hue = y / h;
      hue = (hue - Math.floor(hue)) * 360;
      for(x = 0; x < w; x++){
         var bri = 1 - x / w;
         var rgb = COLOR_SPACE.hsv2rgb(hue, sat * 255, bri * 255);
         //rgb = COLOR_SPACE.getWebSafeColor(rgb);
         imgData.data[index++]  = rgb.r;
         imgData.data[index++]  = rgb.g;
         imgData.data[index++]  = rgb.b;
         imgData.data[index++]  = 255;
      }
   }
   return imgData;
};

ColorCanvas.prototype.setXY = function(x,y){
   this.selX = x; this.selY = y;
   this.paint();
};
ColorCanvas.prototype.setColor = function(c){
   var hsb = COLOR_SPACE.rgb2hsv(c.r,c.g,c.b);
   if ( this.hueBar ){
      this.selZ = hsb.s / 255;
      this.setXY(255 - hsb.v, 255 - (hsb.h/360) * 255);
   }else{
      this.selZ = hsb.h / 360;
      this.setXY(hsb.s,255 - hsb.v);
   }
   this.repaint();
};
ColorCanvas.prototype.getColor = function(){
   var h = (this.hueBar) ? 1 - this.selY/255 : this.selZ;
   var s = (this.hueBar) ? 255: this.selX;
   var v = (this.hueBar) ? this.selX : this.selY;
   
   h = (h - Math.floor(h)) * 360;
   return COLOR_SPACE.hsv2rgb(h,s,255-v);
};

ColorCanvas.prototype.repaint = function(){
   this.newImage = true;
   this.paint();
};

function ColorPicker(){
   this.currentColor = {r:0,g:0,b:0};
}

ColorPicker.prototype.init = function(linkedElement,flat,onColorChange,onOK,onCancel,fnDrawPointer1,fnDrawPointer2){
   this.onColorChange = (onColorChange) ? onColorChange : function(){};
   this.onOK = (onOK) ? onOK : function(){return true;};
   this.onCancel = (onCancel) ? onCancel : function(){return true;};
   this.flat  = (typeof flat === "boolean") ? flat:true;
   if ( this.flat ){
      this._buildUI(linkedElement);
   }else{
      this.linkedElement = linkedElement;
      this._buildUI();
   }
   
   this.element.find("canvas").each(function(){
      var w = $(this).parent().width(),
          h = $(this).parent().height();
      $(this).attr("width",w);
      $(this).attr("height",h);
   });
   
   this.canvasMap = this.element.find(".color-map canvas")[0];
   this.canvasBar = this.element.find(".color-bar canvas")[0];

   this.colorMap = new ColorCanvas(this.canvasMap,false);
   this.colorBar = new ColorCanvas(this.canvasBar,true);
   if ( fnDrawPointer1 ){
      this.colorMap.drawPointer = fnDrawPointer1;
   }
   if ( fnDrawPointer2 ){
      this.colorBar.drawPointer = fnDrawPointer2;
   }
   
   $(this.canvasMap).data("ME",this.colorMap).data("YOU",this.colorBar);
   $(this.canvasBar).data("YOU",this.colorMap).data("ME",this.colorBar);
   
   this._registerEvent();
   
   this.setColor({r:64,g:128,b:128});

   if ( this._isInput() ){
      var val = $(this.linkedElement).val();
      if ( val.length === 7 && val.charAt(0) === "#" ){
         this.currentColor = COLOR_SPACE.parseColor(val);
         if ( !this.currentColor ){
            this.currentColor = {r:64,g:128,b:128};
         }
      }
   }        
   return this;
};
ColorPicker.prototype._isInput = function(){
   return (this.linkedElement && this.linkedElement.nodeName.toLowerCase() === "input" &&
           $(this.linkedElement).attr("type") === "text");
};

ColorPicker.prototype.CLAMP = function(c,min,max){
   min = min || 0; max = max || 255;
   if ( c < min ) { c = min; }
   if ( c > max ) { c = max; }
   return Math.round(c);
};

ColorPicker.prototype._restoreToInitial = function(){
   var color = this.initialColor;
   if ( this._isInput() ){
      $(this.linkedElement).val(COLOR_SPACE.RGB2HEX(color));
   }else{
      $(this.linkedElement).css("background-color","rgb(" + color.r + "," + color.g + "," + color.b + ")");
   }
   this.colorChanged(color);
};

ColorPicker.prototype._registerEvent = function(){
   var _this = this;
   this.mouseStarted = false;
   
   if ( this._isInput() ){
      $(this.linkedElement).bind("focus",function(event){_this.show();});
   }else{
      $(this.linkedElement).bind("mousedown",function(event){_this.show();});
   }
   this.element.find(".old-color").click(function(){
      _this._restoreToInitial();
   });
      
   $(this.canvasBar).add(this.canvasMap)
      .bind("mousedown",function(event){
         _this.mouseStarted = true;
         var offset = $(this).offset();
         var x = event.pageX - offset.left, y = event.pageY - offset.top;
         _this._trackChanging(x,y,this);
      })
      .bind("mouseup" ,function(event){_this.mouseStarted = false;})
      .bind("mouseout",function(event){_this.mouseStarted = false;})
      .bind("mousemove",function(event){
         if ( _this.mouseStarted ){ 
            var offset = $(this).offset();
            var x = event.pageX - offset.left, y = event.pageY - offset.top;
            _this._trackChanging(x,y,this);
         }
      });

   this.element.find("input[name=R],input[name=G],input[name=B]")
      .bind("keyup",function(){
         var v = $(this).val();
         if ( !isNaN(parseFloat(v)) && isFinite(v) ){
            v = _this.CLAMP(v,0,255);
            switch( this.name ){
            case "R": _this.currentColor.r = v; break;
            case "G": _this.currentColor.g = v; break;
            case "B": _this.currentColor.b = v; break;
            }
            _this.setColor(_this.currentColor);
         }else{
            _this.setColor(_this.currentColor);
            return false;
         }            
      });

   this.element.find("input[name=H],input[name=S],input[name=V]")
      .bind("keyup",function(){
         var v = $(this).val();
         if ( !isNaN(parseFloat(v)) && isFinite(v) ){
            var hsv = COLOR_SPACE.rgb2hsv(_this.currentColor);
            //hsv.s = parseInt((hsv.s / 255 * 100).toFixed(0));
            //hsv.v = parseInt((hsv.v / 255 * 100).toFixed(0));
            v = parseFloat(v);
            switch( this.name ){
            case "H": v = _this.CLAMP(v,0,359); hsv.h = v; break;
            case "S": v = _this.CLAMP(v,0,100); hsv.s = (v*255/100); break;
            case "V": v = _this.CLAMP(v,0,100); hsv.v = (v*255/100); break;
            }
            _this.currentColor = COLOR_SPACE.hsv2rgb(hsv);
            _this.setColor(_this.currentColor);
         }else{
            _this.setColor(_this.currentColor);
         }
      });
   
   this.element.find("input[name=RGB]").bind("change",function(){
      var color = COLOR_SPACE.parseColor($(this).val());
      if ( color ){
         _this.setColor(color);
         _this.colorChanged(color);
      }
   }).focus(function(){$(this).select();});
   
   this.element.find("button[name=ok]")
      .click(function(){
         if ( _this.onOK ){
            if ( _this.onOK(_this.currentColor,COLOR_SPACE.rgb2hsv(_this.currentColor)) ){
               _this.hide();
            }
         }else{   
            _this.hide();
         }
      });
   this.element.find("button[name=cancel]")
      .click(function(){
         _this._restoreToInitial();
         if ( _this.onCancel ){
            if ( _this.onCancel(_this.initialColor,COLOR_SPACE.rgb2hsv(_this.initialColor)) ){
               _this.hide();
            }
         }else{
            _this.hide();
         }
      });
};
ColorPicker.prototype.setInitialColor = function(color){
   this.initialColor = color;
   this.element.find(".old-color").css("backgroundColor",COLOR_SPACE.RGB2HEX(color));
   return this.setColor(color);
};

ColorPicker.prototype.setColor = function(color){
      this.currentColor = color;
      this.setColorText(this.currentColor);
      this.colorMap.setColor(this.currentColor);
      this.colorBar.setColor(this.currentColor);
      return this;
};

ColorPicker.prototype._trackChanging = function(x,y,canvas){
   var x1 = this.CLAMP(( x * 255 ) / canvas.width,0,255);
   var y1 = this.CLAMP(( y * 255 ) / canvas.height,0,255);
   $(canvas).data("ME").setXY(x1,y1);
   var color = $(canvas).data("ME").getColor();
   $(canvas).data("YOU").setColor(color);
   if ( color ){
      this.colorChanged(color);
   }
};

ColorPicker.prototype.colorChanged = function(color){
   this.currentColor = color;
   this.setColorText(color);

      if ( this._isInput() ){
         $(this.linkedElement).val(COLOR_SPACE.RGB2HEX(color));
      }else{
         $(this.linkedElement).css("background-color","rgb(" + color.r + "," + color.g + "," + color.b + ")");
      }

   if ( this.onColorChange ){
      this.onColorChange(color,COLOR_SPACE.rgb2hsv(color));
   }
};

ColorPicker.prototype.setColorText = function(color){
      this.element.find("input[name=RGB]").val(COLOR_SPACE.RGB2HEX(color));
      this.element.find("input[name=R]").val(color.r);
      this.element.find("input[name=G]").val(color.g);
      this.element.find("input[name=B]").val(color.b);
      var hsv = COLOR_SPACE.rgb2hsv(color);
      hsv.s = (hsv.s / 255 * 100).toFixed(0);
      hsv.v = (hsv.v / 255 * 100).toFixed(0);
      this.element.find("input[name=H]").val(hsv.h);
      this.element.find("input[name=S]").val(hsv.s);
      this.element.find("input[name=V]").val(hsv.v);
      
      this.element.find(".preview .cur-color").css("background-color","rgb(" + color.r + "," + color.g + "," + color.b + ")");
      $(this.linkedElement).data("current_color",color);
};
ColorPicker.prototype.getColor = function(){
   return this.currentColor;
};

ColorPicker.prototype.show = function(){
   if ( this.element.css("visibility") === "hidden" ){
      var off = $(this.linkedElement).offset();
      var left = off.left, top = off.top + $(this.linkedElement).outerHeight();
      if ( left + this.element.width() > $(window).width() + $("body").scrollLeft() ){
         left =  $(window).width() + $("body").scrollLeft() - this.element.width() - 10;
      }
      
      if ( top + this.element.height() > $(window).height() + $(window).scrollTop() ){
         top =  off.top - this.element.height() - 10;
      }
      
      this._mask.css("display","");
      this.element.css({
         "visibility":"visible",
         "left":left + "px",
         "top":top + "px"
      }).animate({
         opacity:1
      },300);
      var color = $(this.linkedElement).data("current_color");
      if ( this.linkedElement.nodeName.toLowerCase() === "input" &&
           $(this.linkedElement).attr("type") === "text" ){
         var val = $(this.linkedElement).val();
         if ( val.length === 7 && val.charAt(0) === "#" ){
            color = COLOR_SPACE.parseColor(val);
         }
      }        
      
      if ( color ){
         this.setInitialColor(color);
      }
   }
   return this;
};
ColorPicker.prototype.hide = function(){
   if ( this.element.css("visibility") !== "hidden" ){
      this._mask.css("display","none");
      this.element.animate({
         opacity:0
      },300,function(){$(this).css("visibility","hidden");});
   }
   return this;
};

ColorPicker.prototype._buildUI = function(element){
   var idext = Math.round(Math.random() * 1000000 * (new Date()));
   var cp = this,css = {position:"absolute",left:"0px",top:"0px",visibility:"hidden",zIndex:10001};
   var e = $("body");
   var cls = " popup";
   if ( element ){
      e = $(element);
      var w = e.width(),h = e.height();
      if ( e.css("position") == "relative" || e.css("position") == "absolute" ){
         css = {position:"absolute",left:"0px",top:"0px",visibility:"visible",width:w + "px",height:h+"px"};
      }else{
         e.css("position","relative");
         css = {position:"absolute",left:"0px",top:"0px",visibility:"visible",width:w + "px",height:h+"px"};
      }
      cls = "";
   }else{
      e.append(
         // mask
         $("<div></div>")
            .attr("id","cp-mask-" + idext)
            .css({position:"absolute",left:"0px",top:"0px",
                  width:$(document).width()+"px",
                  height:$(document).height()+"px",
                  zIndex:10000,
                  opacity:0.01,
                  display:"none"}).each(function(){cp._mask = $(this);})
            .bind("mousedown",function(){cp.hide();})
      );
   }
   e.append(
      $('<div class="canvas-color-picker' + cls + '"></div>')
         .attr("id","cp-" + idext)
         .css(css)
         .append('<div class="color-map"><canvas name="colormap"></canvas></div>')
         .append('<div class="color-bar"><canvas name="huebar"></canvas></div>')
         .append('<div class="preview"><div class="cur-color"></div><div class="old-color"></div></div>')
         .append(
            $('<div class="form"></div>')
               .append(
                  $('<div class="rgb"></div>')
                     .append('<label>R:</label><input type="text" name="R" size="3" maxlength="3"/><br />')
                     .append('<label>G:</label><input type="text" name="G" size="3" maxlength="3" /><br />')
                     .append('<label>B:</label><input type="text" name="B" size="3" maxlength="3" />')
               ) 
               .append(
                  $('<div class="hsb"></div>')
                     .append('<label>H:</label><input type="text" name="H" size="3" maxlength="3"/><label>&deg;</label><br />')
                     .append('<label>S:</label><input type="text" name="S" size="3" maxlength="3"/><label>%</label><br />')
                     .append('<label>B:</label><input type="text" name="V" size="3" maxlength="3"/><label>%</label>')
               )
               .append(
                  $('<div class="color"></div>')
                     .append('<label>#:</label><input type="text" name="RGB" size="7" maxlength="7"/>')
               )
         )
         .append('<div class="buttons"><button name="ok">OK</button><button name="cancel">Cancel</button></div><br />')
         .each(function(){
            cp.element = $(this);
         })
   );
};
ColorPicker.prototype.showRGB = function(flag){
   var rgb = this.element.find(".form .rgb");
   if(flag){rgb.show();}else{rgb.hide();}
   return this;
};
ColorPicker.prototype.showHSB = function(flag){
   var hsb = this.element.find(".form .hsb");
   if(flag){hsb.show();}else{hsb.hide();}
   return this;
};
ColorPicker.prototype.showColor = function(flag){
   var clr = this.element.find(".form .color");
   if(flag){clr.show();}else{clr.hide();}
   return this;
};
ColorPicker.prototype.showButtons = function(flag){
   var e = this.element.find(".buttons");
   if(flag){e.show();}else{e.hide();}
   return this;
};
ColorPicker.prototype.showPreview = function(flag){
   var e = this.element.find(".preview");
   if(flag){e.show();}else{e.hide();}
   return this;
};
ColorPicker.prototype.sizeTo = function(w,h){
   if ( w < 60 ) { w = 60; }
   if ( h < 30 ) { h = 30; }
   this.element.width(w).height(h);
   if ( h < 150 ){
      this.showRGB(false).showHSB(false).showButtons(false);
   }
   if ( h < 100 ){
      this.showPreview(false).showColor(false);
   }
   
   if ( w < 200 ){
      this.showRGB(false).showHSB(false).showPreview(false).showColor(false).showButtons(false);
   }
   
   this._rearrange();
   return this;
};
ColorPicker.prototype._rearrange = function(){
   var w = this.element.width(),
       h = this.element.height();
   if ( h < 200 ){
      this.showRGB(false);
      this.showHSB(false);
   }
   this.element.find("canvas[name=colormap]")
      .attr({
         "width":this.element.find(".color-map").width(),
         "height":this.element.find(".color-map").height()
      });
   this.element.find("canvas[name=huebar]").attr("height",this.element.find(".color-bar").height());
   var rgb = this.element.find(".form .rgb");
   var hsb = this.element.find(".form .hsb");
   var clr = this.element.find(".form .color");
   var btns = this.element.find(".buttons");
   var preview = this.element.find(".preview");
   
   if ( rgb.css("display") === "none" && hsb.css("display") === "none" && 
        clr.css("display") === "none" && btns.css("display") === "none" &&
        preview.css("display") === "none" ){
      this.element.find(".color-map").css("right","30px");
      this.element.find(".color-bar").css("right","5px");
      
      this.element.find("canvas[name=colormap]")
         .attr({
            "width":this.element.find(".color-map").width(),
            "height":this.element.find(".color-map").height()
         });
   }
   if ( rgb.css("display") === "none" && hsb.css("display") === "none" && clr.css("display") === "none" ){
      this.element.find(".form").hide();
   }else{
      this.element.find(".form").show();
   }
           
   if ( rgb.css("display") === "none" &&
        hsb.css("display") === "none" ){
      this.element.find(".buttons").css("height","50px");
      this.element.find(".buttons button").css("width","110px");
   }else{
      this.element.find(".buttons").css("height","25px");
      this.element.find(".buttons button").css("width","55px");
   }

   this.colorMap.repaint();        
   this.colorBar.repaint();         
   
};

(function($){
   $.fn.CanvasColorPicker = function(options){
      addStyle();
      var settings = {
         flat               : false,
         width              : 400,
         height             : 260,
         showColor          : true,
         showRGB            : true,
         showHSB            : true,
         showButtons        : true,
         showPreview        : true,
         color              : {r:0,g:0,b:0},
         onColorChange      : function(rgb,hsv){},
         onOK               : function(rgb,hsv){return true;},
         onCancel           : function(rgb,hsv){return true;},
         drawColorMapPointer: null,
         drawHueMapPointer  : null
      };
      
      return this.each(function(){
         if ( options ) { 
            $.extend( settings, options );
            settings.color = checkColor(settings.color);
         }    
         if ( !$(this).data("canvas-color-picker") ){
            var cp = new ColorPicker()
               .init(
                 this,
                 settings.flat,
                 settings.onColorChange,
                 settings.onOK,
                 settings.onCancel,             
                 settings.drawColorMapPointer,
                 settings.drawHueMapPointer
               )
               .setInitialColor(settings.color)
               .showRGB(settings.showRGB)
               .showHSB(settings.showHSB)
               .showColor(settings.showColor)
               .showButtons(settings.showButtons)
               .showPreview(settings.showPreview);
               
            if ( settings.flat ){
               cp.sizeTo($(this).width(),$(this).height());
            }else{
               cp.sizeTo(settings.width,settings.height);
            }
            !$(this).data("canvas-color-picker",cp)
         }            
      });
      
      function checkColor(color){
         if ( typeof(color) === "object" && 
              color.hasOwnProperty("r") && 
              color.hasOwnProperty("g") && 
              color.hasOwnProperty("b") ){
            color.r = (color.r < 0)?0:((color.r > 255)?255:color.r);
            color.g = (color.g < 0)?0:((color.g > 255)?255:color.g);
            color.b = (color.b < 0)?0:((color.b > 255)?255:color.b);
         }else{
            color = {r:0,g:0,b:0};
         }
         return color;
      }
      function addStyle(){
         if ( $.fn.CanvasColorPicker.StyleReady ){
            return;
         }
         $.fn.CanvasColorPicker.StyleReady = true;
         var arrStyle = [
            "<style type='text/css'>",
            ".canvas-color-picker{position:relative;width:400px;height:260px;background:transparent;}",
            ".canvas-color-picker.popup{background: -webkit-gradient(linear, 0 0, 0 bottom, from(#efefef), to(#dddddd));background: -moz-linear-gradient(#efefef, #dddddd);background: linear-gradient(#efefef, #dddddd);filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0, startColorstr=#efefef,endColorstr=#dddddd);box-shadow:3px 2px 5px #888888;-moz-box-shadow: 3px 2px 10px #888888;-webkit-box-shadow: 3px 2px 5px #888888; border:1px solid #eeeeee;}",
            ".canvas-color-picker .color-map{position:absolute;left:5px;top:5px;bottom:5px;right:145px;}",
            ".canvas-color-picker .color-bar{position:absolute;width:20px;right:120px;top:5px;bottom:5px;}.canvas-color-picker .preview{position:absolute;top:5px;right:38px;width:75px;height:60px;border:1px solid black;border-right:1px solid white;border-bottom:1px solid white;}",
            ".canvas-color-picker .preview .cur-color,.canvas-color-picker .preview .old-color{position:relative;height:30px;width:75px;background:blue;}",
            ".canvas-color-picker .preview .old-color{background:green;}",
            ".canvas-color-picker .form{position:absolute;padding:0px;margin:0px;top:70px;right:5px;width:110px;height:92px;text-align:left;}",
            ".canvas-color-picker .form br{clear:both;}",
            ".canvas-color-picker .form .rgb,.canvas-color-picker .form .hsb{position:relative;left:0px;top:0px;width:50px;height:70px;float:left;}",
            ".canvas-color-picker .form .hsb{width:60px;}",
            ".canvas-color-picker .form .color{position:relative;width:100px;height:20px;clear:both;}",
            ".canvas-color-picker .form label{font:11px arial;width:15px;height:22px;display:block;float:left;line-height:20px;}",
            ".canvas-color-picker .form input{font:11px arial;width:24px;display:block;float:left;}",
            ".canvas-color-picker .form .color input{width:55px;}",
            ".canvas-color-picker .buttons{position:absolute;bottom:5px;right:5px;width:110px;height:25px;}",
            ".canvas-color-picker .buttons button{position:relative;font:bold 12px arial;width:55px;height:25px;line-height:25px;padding:0px;}",
            "</style>"
         ];
         $(arrStyle.join("")).appendTo("head");
      }
   };
})(jQuery);
