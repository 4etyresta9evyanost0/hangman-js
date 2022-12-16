'use strict';

const canv = document.querySelector('#canv');
let w;
let h;
let orderedHangmanArray = [];

const g = canv.getContext('2d');

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

class Point{
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }


}

class Vector{
    constructor(begin, end){
        this.begin = begin;
        this.end = end;
    }

    get x() {
        return this.begin.x - this.xend.x;
    }

    get y() {
        return this.begin.y - this.end.y;
    }


    get center(){
        return this.divideBy(1,1);
    }

    getProcented(procent){
        return this.divideBy(procent,1);
    }

    get length(){
        return (this.getX()**2+this.getY()**2)**0.5;
    }

    divideBy(first, second){

        let div = first/second;

        let x1 = this.begin.x;
        let x2 = this.end.x;

        let y1 = this.begin.y;
        let y2 = this.end.y;

        let xc = (x1 + div*x2)/(1+div);
        let yc = (y1 + div*y2)/(1+div);

        return new Point(xc, yc);
    }

    normalize(){
        let len = this.length;

        let begin = new Point(this.begin.x, this.begin.y);

        let end = new Point(
            this.x / this.length,
            this.y / this.length,
        )


        return Vector(begin, end)
    }
}

class GraphicsObj {
    static allObjects = [];
    constructor(x, y, context = g) {
        this.x = x;
        this.y = y;
        this.context = context;
        this.showing = false;

        GraphicsObj.allObjects.push(this);
    }

    show = () => this.showing = true;
    hide = () => this.showing = false;

    draw() { }
}

class Line extends GraphicsObj {
    

    constructor(x1, y1, x2, y2, strokeWidth = 1, strokeStyle = 'black', context = g) {
        super(x1, y1, context);
        this.x2 = x2;
        this.y2 = y2;
        this.strokeWidth = strokeWidth;
        this.strokeStyle = strokeStyle;

        this.step = 0.025;
        this.currentStep = 0;

    }

    startAnim(){};

    show = () => {this.showing = true; this.currentStep = 0;}
    draw = () => {
        const c = this.context;
        c.save();

        c.lineWidth = this.strokeWidth;
        c.strokeStyle = "hsla(" + (this.currentStep * 360) + ",100%,50%,1)";
        c.strokeStyle = this.strokeStyle;
        if (this.currentStep < 1)
            this.currentStep = this.currentStep + this.step;

        let begin = new Point(this.x,this.y);
        let end = new Point(this.x2,this.y2);

        let vec = new Vector(begin, end);
        let p =vec.divideBy(this.currentStep,1-this.currentStep);

        c.beginPath();
        c.moveTo(begin.x, begin.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        c.restore();
        /* 
        
        */
        

    }

    get length(){
        return ((this.x2 - this.x)**2 + (this.y2 - this.y)**2)**0.5;
    }
}

class PolyLine extends Line{
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

function main() {

    w = canv.width = 700;
    h = canv.height = 500;

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
    
    gallow.show();

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

main();
let word = 'Тестест';
let wordElem = document.querySelector('.word');
let mainElem = document.querySelector('main.wrapper');
let confirmElem = document.querySelector('.confirmation');

let mainElemHeight = mainElem.style.maxHeight;
let confirmElemHeight = confirmElem.style.maxHeight;
mainElem.style.maxHeight = '0';


let wordInput = document.querySelector('.word-input');
let guessButton = document.querySelector('#guessButton');
let rndButton = document.querySelector('#rndButton');
let errorText = document.querySelector('#errorText');


guessButton.onclick = (e) => {
    if (wordInput.value == ""){
        alert('Ошибка! Не было введено слово!')
        return;
    }

    let rexp = /(?![А-ЯЁёа-я\-])/g;
    let matches = wordInput.value.match(rexp);
    console.log(matches);
    if (matches.length > 1){
        alert('Ошибка! Слово не подходит под текст!')
        return;
    }
    confirmElem.style.transition = mainElem.style.transition = 'max-height 1s ease-in-out';
    mainElem.style.maxHeight = mainElemHeight;
    
    confirmElem.style.maxHeight = '0';

    word = wordInput.value;
    wordElem.title = '';
    mainGame();
}

function getRnd(min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
}

rndButton.onclick = (e) => {
    confirmElem.style.transition = mainElem.style.transition = 'max-height 1s ease-in-out';
    mainElem.style.maxHeight = mainElemHeight;
    confirmElem.style.maxHeight = '0';
    let rndNum = getRnd(0,words.length);
    let wordArr = words[rndNum];
    console.log(rndNum);
    word = wordArr[0];
    mainGame();

    wordElem.title = wordArr[1];
}

function confirmShow() {
    confirmElem.style.maxHeight = confirmElemHeight;
}

function buttonsEnable() {
    document.querySelectorAll('button:not(#guessButton,#rndButton)').forEach(n=>{
        if (!n.classList.contains('checked'))
            n.classList.add('checked');
    })
}

function buttonsDisable() {
    document.querySelectorAll('button.checked').forEach(n=>{
        n.classList.remove('checked');
    })
}

let keyboard = document.querySelector('.keyboard');
//orderedHangmanArray[1].show();

let showAll = function () {
    GraphicsObj.allObjects.forEach(el => {
        if (el.showing)
            el.draw();
    });
}

function anim()
{
    g.save();
    g.clearRect(0, 0, w, h);
    showAll();
    g.restore();

    window.requestAnimationFrame(anim);
}

anim();

function mainGame(params) {
    wordElem.classList.remove('word-bad');
    wordElem.classList.remove('word-good');

    wordElem.innerHTML = '';
    buttonsDisable();
    orderedHangmanArray.forEach(n=>n.hide());
    for (let i = 0; i < word.length; i++)
    {
        wordElem.innerHTML += '<span class="char">_</span> ';
    }
    let hangmanIndex = 0;
    let toComplete = word.length;
    charChangeFunc = function(char){

        let upWord = word.toUpperCase();
        let chars = document.querySelectorAll('.char');
        

        let indexes = [];
        let count = 0;
        if (upWord.includes(char)){
            for (let i = 0, ind = 0; (ind = upWord.indexOf(char, i)) !== -1; i = ind + 1)
            {
                indexes.push(ind);
                if (count++ > 100)
                break;
            }
            for (let i = 0; i < indexes.length; i++)
                chars[indexes[i]].innerHTML = /*indexes[i]? char.toLowerCase() :*/ char;
            
            toComplete -= indexes.length;
            console.log(toComplete);
            if (toComplete === 0)
            {
                confirmShow();
                buttonsEnable();
                wordElem.classList.add('word-good');
            }
        }
        else{
            if (hangmanIndex + 1 <= orderedHangmanArray.length){
                orderedHangmanArray[hangmanIndex++].show();
            }
            else{
                orderedHangmanArray[0].hide();
                for (let i = 0; i < chars.length; i++) {
                    chars[i].innerHTML = word[i].toUpperCase();
                    wordElem.classList.add('word-bad');
                    buttonsEnable();
                    
                }
                confirmShow();
            }
        }
    }
}
