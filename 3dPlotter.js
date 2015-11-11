<script src="http://js.do/js/processing-1.1.0.min.js"></script>

<style>
div {
	margin: 5px;
    border-radius: 17px;
    border: 2px solid #00C007;
    padding: 7px;    
}
</style>

<script type="application/processing" id="script1">

void setup() {
  size(500, 300, P3D);  
  cx=width/2-300 ;
  cy=height/2-200 ;
  mouseMode= "camera" ;
  getStudentData() ;

}

void draw() {
  //getStudentData() ;
  background(255);
  if (mousePressed && mouseMode=="camera") {
  	cx= mouseX;
    cy= mouseY;
  } else if (mousePressed) {
  	pick() ;
  }
  perspective(0.3, width/height, 3, 3000); 
  camera(cx, cy, (height/2) +300, width/2, height/2, 0, 0, 1, 0);
  
  pushMatrix() ;
  translate(width/2+50, height/2, -100);
  stroke(0);
  noFill();
  box(100);
  fill(0,100,10);
  text("   Metacognitive skills \nricardogang@gmail.com ",-20,90,0);
  popMatrix() ;
  
  drawStudents() ;
}

void getStudentData() {
  students=[
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255],
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255],
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255],
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255],
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255],
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255],
  [Math.random()*100,Math.random()*100,Math.random()*100,Math.random()*255]
  ]
}

void drawStudents() {
	for (i=0;i<7;i++) {    	
		drawStudent(students[i][0],students[i][2],students[i][2],students[i][3]) ;
    }
}

void pick() {
	//alert(mouseX+" - "+mouseY) ;
}

void drawStudent(x,y,z,color) {
	//x=50;y=0;z=50;
	pushMatrix() ;
  	translate(x+(width/2),-z+(height/2+50),y+-150);
  	stroke(0,color,100);
  	sphere(2);
    popMatrix() ;
}

</script>
 
<div>
<canvas id="canvas1"></canvas>
</div>

<div>
<form>
MOUSE:<br>
<input type="radio" name="mouseMode" checked=true onclick="changeMouseMode(this.value)" value="camera">Mover cámara<br>
<input type="radio" name="mouseMode" onclick="changeMouseMode(this.value)" value="pick">Seleccionar<br>
</form>
</div>

<script>
 mouseMode= "camera"  ;
 var script_text = document.getElementById('script1').text;
 var canvas=document.getElementById('canvas1');

 new Processing(canvas, script_text);
 
 function changeMouseMode(mode) {
 	mouseMode= mode ;
 }
</script>

