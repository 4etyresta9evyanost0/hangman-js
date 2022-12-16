let charsArr = [];

let charChangeFunc = () => console.error('Функция не перегрузилась');

charsArr.pushNew = charsArr.push;

charsArr.push = (elem) => {
    charsArr.pushNew(elem);
    charChangeFunc(elem);
}

document.querySelectorAll('button').forEach(n=>{
    n.onclick = (e) =>{
        if (!(elem = e.target).classList.contains('checked'))
        {   
            elem.classList.add('checked');
            charsArr.push(elem.innerHTML);
            charsArr.sort();
        }
    }
})