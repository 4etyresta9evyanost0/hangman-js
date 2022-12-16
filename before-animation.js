'use strict';

function getClientCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: element.width / 2,
        y: element.height / 2
    }
}

function getTopLeftPoint(x, y, width, height) {
    return {
        x: x - width / 2,
        y: y - height / 2
    }
}

class GraphicsObj {
    static allObjects = []
    constructor(x, y, context = g) {
        this.x = x;
        this.y = y;
        this.context = context;
        GraphicsObj.allObjects.push(this);
    }

    draw() { }
}

class Line extends GraphicsObj {
    

    constructor(x1, y1, x2, y2, strokeWidth = 1, strokeStyle = 'black', context = g) {
        super(x1, y1, context);
        this.x2 = x2;
        this.y2 = y2;
        this.strokeWidth = strokeWidth;
        this.strokeStyle = strokeStyle;
    }

    draw = () => {
        this.context.lineWidth = this.strokeWidth;
        this.context.strokeStyle = this.strokeStyle;
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x2, this.y2);
        this.context.stroke();
    }

    getLength(){
        return ((this.x2 - this.x)**2 + (this.y2 - this.y)**2)**0.5;
    }
}

class PolyLine extends Line{

    /*
        ponintArray = [
            x1,y1,
            x2,y2,
            x3,y3,
            .....,
        ]
    */

    constructor(pointArray, strokeWidth = 1, strokeStyle = 'black', context = g){
        if (pointArray.length % 2 != 0){
            throw new Error('pointArray должен быть кратен 2');
        }
        let last = pointArray.length - 1;
        super(pointArray[0], pointArray[1], pointArray[last-1], pointArray[last], strokeWidth, strokeStyle, context);
        this.pointArray = pointArray;
        this.begin = {x: this.x, y: this.y};
        this.end = {x: this.x2, y: this.y2};
        
    }
    draw = () =>{
        this.context.lineWidth = this.strokeWidth;
        this.context.strokeStyle = this.strokeStyle;
        this.context.beginPath();
        this.context.moveTo(this.pointArray[0],this.pointArray[1]);
        for (let i = 2; i < this.pointArray.length; i+=2)
        {
            let x = this.pointArray[i];
            let y = this.pointArray[i+1];
            this.context.lineTo(x, y);
        }
        this.context.stroke();
    }
}

class Rect extends GraphicsObj {
    constructor(x, y, width, height, fillStyle = 'black', context = g) {
        super(x, y, context);
        this.width = width;
        this.height = height;
        this.fillStyle = fillStyle;
    }

    draw = () => {
        this.context.fillStyle = this.fillStyle;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ellipse extends Rect {
    constructor(x, y, width, height, strokeWidth = 1, strokeStyle = 'black', fillStyle = 'transparent', context = g) {
        super(x, y, width, height, fillStyle, context);
        this.strokeWidth = strokeWidth;
        this.strokeStyle = strokeStyle;
    }

    draw = () => {
        let g = this.context;
        g.beginPath();

        g.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
        g.lineWidth = this.strokeWidth;
        g.strokeStyle = this.strokeStyle;
        g.stroke();
        g.fillStyle = this.fillStyle;
        g.fill();
    }
}

const canv = document.querySelector('#canv');
let w = canv.width;
let h = canv.height;
let orderedHangmanArray = [];

const g = canv.getContext('2d');

main();

function main() {

    canv.width = 700;
    canv.height = 500;

    if (g === null) {
        alert('Браузер не поддерживает canvas');
        return;
    }


    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';

    const canvPos = getClientCenter(canv);




    let width = 0;
    let height = 0;

    let pos = getTopLeftPoint(canvPos.x, canvPos.y - 50, width, height);

    let manTotalWidth = 60;
    let torsoHeight = 90;
    let neckHeight = 8;
    let limbLength = 65;
    let stoolHeight = 50;
    let ropeLength = 60;

    let head = new Ellipse(pos.x, pos.y - 25, 50, 50, 1);
    let torso = new Line(pos.x, pos.y, pos.x, pos.y + torsoHeight);
    let rightArm = new Line(pos.x, pos.y + neckHeight, pos.x - manTotalWidth/2, pos.y + limbLength);
    let leftArm = new Line(pos.x, pos.y + neckHeight, pos.x + manTotalWidth/2, pos.y + limbLength);
    let rightLeg = new Line(pos.x, pos.y + torsoHeight, pos.x - manTotalWidth/2, pos.y + torsoHeight + limbLength);
    let leftLeg = new Line(pos.x, pos.y + torsoHeight, pos.x + manTotalWidth/2, pos.y + torsoHeight + limbLength);
    let rope = new Line(pos.x, head.y - head.height / 2 - ropeLength, pos.x, head.y - head.height / 2, 2, '#a62500');
    
    let fullHeight = head.height + torsoHeight + ropeLength + limbLength;
    let gallow = new PolyLine(
        [
            rope.x-10,rope.y,
            rope.x2+100, rope.y,
            rope.x2+100, rope.y + fullHeight + stoolHeight,
        ],
        5
    )

    let stoolMargin = 8;
    let stool = new PolyLine(
        [
            pos.x-manTotalWidth/2 - stoolMargin, gallow.y + fullHeight,
            pos.x+manTotalWidth/2 + stoolMargin, gallow.y + fullHeight,
            pos.x+manTotalWidth/2 - stoolMargin, gallow.y + fullHeight,
            pos.x+manTotalWidth/2 - stoolMargin, gallow.y + fullHeight + stoolHeight,

            pos.x+manTotalWidth/2 - stoolMargin, gallow.y + fullHeight,
            pos.x-manTotalWidth/2 + stoolMargin, gallow.y + fullHeight,
            pos.x-manTotalWidth/2 + stoolMargin, gallow.y + fullHeight + stoolHeight,
            

        ],
        5, 
    );
    
    gallow.draw();
    

    orderedHangmanArray = [
        stool,
        rope,
        head,
        torso,
        leftArm,
        rightArm,
        rightLeg,
        leftLeg
    ]


    


}

