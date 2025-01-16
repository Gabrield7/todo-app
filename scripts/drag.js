const container = document.querySelector('.container');
const boxes = Array.from(document.querySelectorAll('.task-box'));
const allItems = Array.from(document.getElementsByClassName('task'));

let element = {
    target: null,
    offsetX: null,
    offsetY: null,
    locked: null //Trava de proteção para que seja aguardado o elemento chegar à posição original antes de interagir novamente com ele
};

const rect = target => target.getBoundingClientRect();

const boxPosition = (box) => {
    return {
        left: box.getAttribute('x'),
        top: box.getAttribute('y')
    };
};

const setElementPosition = (item, { positionCallback, referenceItem, left, top }) => {     
    if (positionCallback && referenceItem) {
        const { left: calcLeft, top: calcTop } = positionCallback(referenceItem);
        item.style.left = `${calcLeft}px`;
        item.style.top = `${calcTop}px`;
    } else if (left !== undefined && top !== undefined) {
        item.style.left = `${left}px`;
        item.style.top = `${top}px`;
    }
};

function isInsideItemArea(xPosition, yPosition){
    if (!element.target) return;

    const internArea = insideItemArea(element.target, .5, 1);

    if(xPosition > internArea.left && xPosition < internArea.right && yPosition > internArea.top && yPosition < internArea.bottom){
        return true;
    }

    return false;
};

const cursorGlobalState = (() => {
    const cursorPosition = {
        x: null,
        y: null,
        lastX: null,
        lastY: null,
        mouseDownTime: null,
        mouseDown: false,
        throttled: false //Trava para evitar o registro muito elevado de eventos realizados em 'mousemove'
    };
    // Atualiza as coordenadas do cursor globalmente
    window.addEventListener('mousemove', (e) => {
        cursorPosition.lastX = cursorPosition.x;
        cursorPosition.lastY = cursorPosition.y;

        cursorPosition.x = e.clientX; // Posição X em relação à viewport
        cursorPosition.y = e.clientY; // Posição Y em relação à viewport
        
        if(element.target && cursorGlobalState.mouseDown) followCursor(element.target);

        // if (cursorPosition.x < 0 || cursorPosition.x > window.innerWidth || cursorPosition.y < 0 || cursorPosition.y > window.innerHeight) { //Controle das bordas da janela do navegador
        //     if(element.target) backToPosition(element.target);
        // }
    });
    // Detecta quando o botão do mouse é pressionado
    window.addEventListener('mousedown', () => {
        cursorPosition.mouseDown = true;
    });
    // Detecta quando o botão do mouse é liberado
    window.addEventListener('mouseup', () => {
        cursorPosition.mouseDown = false;
    });
    
    return cursorPosition;
})();

function insideItemArea(item, xFactor, yFactor){
    if (!item || xFactor < 0 || yFactor < 0) return

    const widthLimiter = rect(item).width * (1 - xFactor)/2;
    const heightLimiter = rect(item).height * (1 - yFactor)/2;
    
    return {
        right: rect(item).right - widthLimiter,
        left: rect(item).left + widthLimiter,
        bottom: rect(item).bottom - heightLimiter,
        top: rect(item).top + heightLimiter
    };
};

function followCursor(target) {    
    if(!element.offsetX || !element.offsetY) return;
    //console.log('ggg');
    
    const targetRect = rect(target);
    const delta = { //Deslocamento do cursor ao relação a movimentação anterior
        x: cursorGlobalState.x - cursorGlobalState.lastX || 0,
        y: cursorGlobalState.y - cursorGlobalState.lastY || 0
    };
    
    //let left = rect(element.target).left;
    //if(element.locked){
        let left = cursorGlobalState.x - element.offsetX;
    //};

    let top = cursorGlobalState.y - element.offsetY;
    
    // Verifica as bordas ESQUERDA e DIREITA
    if (targetRect.right >= window.innerWidth || targetRect.left <= 0) {
        // Borda direita
        if (targetRect.right >= window.innerWidth) {
            left = targetRect.right - targetRect.width; // Cálculo do 'left' para a borda direita
            
            if (delta.x <= 0) { // Quando o cursor se movimentar na direção oposta à borda, o elemento deve voltar a 'se prender' ao cursor
                element.offsetX = cursorGlobalState.lastX - targetRect.left;
                left = cursorGlobalState.x - element.offsetX; // Atualiza a posição X para seguir o cursor
            };
        };
        // Borda esquerda
        if (targetRect.left <= 0) {
            left = 0; // Cálculo do 'left' para a borda esquerda
            
            if (delta.x >= 0) { // Quando o cursor se movimentar na direção oposta à borda, o elemento deve voltar a 'se prender' ao cursor
                element.offsetX = cursorGlobalState.lastX - targetRect.left;
                left = cursorGlobalState.x - element.offsetX; // Atualiza a posição X para seguir o cursor
            };
        };
    };

    // Verifica as bordas SUPERIOR e INFERIOR
    //if(element.locked){
        if (targetRect.bottom >= window.innerHeight || targetRect.top <= 0) {
            // Borda inferior
            if (targetRect.bottom >= window.innerHeight) {
                top = targetRect.bottom - targetRect.height; // Cálculo do 'top' para a borda inferior
                
                if (delta.y <= 0) { // Quando o cursor se movimentar na direção oposta à borda, o elemento deve voltar a 'se prender' ao cursor 
                    element.offsetY = cursorGlobalState.lastY - targetRect.top;
                    top = cursorGlobalState.y - element.offsetY; // Atualiza a posição Y para seguir o cursor
                };
            };
            // Borda superior
            if (targetRect.top <= 0) {
                top = 0; // Cálculo do 'top' para a borda superior
                 
                if (delta.y >= 0) { // Quando o cursor se movimentar na direção oposta à borda, o elemento deve voltar a 'se prender' ao cursor
                    element.offsetY = cursorGlobalState.lastY - targetRect.top;
                    top = cursorGlobalState.y - element.offsetY; // Atualiza a posição Y para seguir o cursor
                };
            };
        }; 
    //}else{
        // if (targetRect.bottom >= rect(container).bottom || targetRect.top <= rect(container).top) {
        //     // Borda inferior
        //     if (targetRect.bottom >= rect(container).bottom) {
        //         top = rect(container).bottom - rect(element.target).height; // Cálculo do 'top' para a borda inferior
        //         //console.log('top', top);
                
        //         if (delta.y <= 0) { // Quando o cursor se movimentar na direção oposta à borda, o elemento deve voltar a 'se prender' ao cursor 
        //             element.offsetY = cursorGlobalState.lastY - targetRect.top;
        //             top = cursorGlobalState.y - element.offsetY; // Atualiza a posição Y para seguir o cursor
        //             //console.log('offsetY', element.offsetY);
                    
        //             console.log('top', top);
                    
        //         };
        //     };
        //     // Borda superior
        //     if (targetRect.top <= rect(container).top) {
        //         top = rect(container).top; // Cálculo do 'top' para a borda superior
                 
        //         if (delta.y >= 0) { // Quando o cursor se movimentar na direção oposta à borda, o elemento deve voltar a 'se prender' ao cursor
        //             element.offsetY = cursorGlobalState.lastY - targetRect.top;
        //             top = cursorGlobalState.y - element.offsetY; // Atualiza a posição Y para seguir o cursor
        //         };
        //     };
        // };
    //};
    
    // element.target.style.left = '80px'
    // element.target.style.top = '80px'
    setElementPosition(element.target, { left, top });
    //console.log('left', left);
    //console.log('top', top);
    console.log('left', rect(element.target).left);
    console.log('top', rect(element.target).top);
    // console.log('left', element.target.style.left);
    // console.log('top', element.target.style.top);
};

// boxes.forEach(box => {
//     const boxItem = box.querySelectorAll('.task');
//     const boxRect = rect(box);

//     box.setAttribute('x', boxRect.left);
//     box.setAttribute('y', boxRect.top);
//     boxItem.forEach(item => {
        
//     });
// });

function applyCursorEvents(box){
    const item = box.querySelectorAll('.task')[0];
    const boxRect = rect(box);

    box.setAttribute('x', boxRect.left);
    box.setAttribute('y', boxRect.top);
    // console.log(boxRect.left);
    // console.log(boxRect.top);
    
    setElementPosition(item, { left: boxRect.left, top: boxRect.top });//Salva a posição dos itens como atributo html

    item.addEventListener('mousedown', e => {
        cursorGlobalState.mouseDownTime = setTimeout(() => {
            if (!element.locked){
                element.target = e.target; //Seleciona o elemento

                //console.log(rect(element.target));
                
                allItems.forEach(task => {
                    if (element.target) {
                        if (task !== element.target && !task.style.transition) {
                                task.style.transition = 'all .5s ease-in-out';
                        };
                        task.style.opacity = task === element.target ? 1 : 0.5;
                        task.style.zIndex = task === element.target ? 1 : 0;
                    } 
                });
                
                if(isInsideItemArea(cursorGlobalState.x, cursorGlobalState.y)){
                    element.offsetX = cursorGlobalState.x - rect(element.target).left;
                    element.offsetY = cursorGlobalState.y - rect(element.target).top;
                    //element.locked = true;
                };

                //console.log('left', rect(element.target).left);
                //console.log('top', rect(element.target).top);
            };
        }, 250);
    });
    
    item.addEventListener('mousemove', () => {
        if (element.target) { //!cursorGlobalState.throttled && 
            // console.log('left', rect(element.target).left);
            // console.log('top', rect(element.target).top);
            // console.log('left', element.target.style.left);
            // console.log('top', element.target.style.top);

            // console.log('offsetX', cursorGlobalState.x - rect(element.target).left);
            // console.log('offsetY', cursorGlobalState.y - rect(element.target).top);

            if(!isInsideItemArea(cursorGlobalState.x, cursorGlobalState.y) && cursorGlobalState.mouseDown && !element.locked){
                element.offsetY = cursorGlobalState.y - rect(element.target).top;
                element.offsetX = cursorGlobalState.x - rect(element.target).left;
                // console.log('offsetX', element.offsetX);
                // console.log('offsetY', element.offsetY);
                element.locked = true;
            }

            // requestAnimationFrame(() => {
            //     treatOverlapping();
            //     reorderItens();
            // })

            // cursorGlobalState.throttled = true;

            // setTimeout(() => {
            //     cursorGlobalState.throttled = false;
            // }, 100);
        };
    });

    item.addEventListener('mouseup', () => {
        clearTimeout(cursorGlobalState.mouseDownTime);

        // allItems.forEach(task => {
        //     if(task.hasAttribute('overlapping')) task.removeAttribute('overlapping');
        // });

        //if (element.target === item) backToPosition(item);
    });

    item.addEventListener('mouseleave', () => {    
        clearTimeout(cursorGlobalState.mouseDownTime);
        
        // allItems.forEach(task => {
        //     if(task.hasAttribute('overlapping')) task.removeAttribute('overlapping')
        // });         

        //if (!cursorGlobalState.mouseDown && element.target === item) backToPosition(item);
    });
    //Ajusta a posição do item quando a viewport é alterada
    // window.addEventListener('resize', () => {
    //     box.setAttribute('x', rect(box).left);
    //     box.setAttribute('y', rect(box).top);

    //     setElementPosition(item, { positionCallback: rect, referenceItem: box })
    // });
};

export {applyCursorEvents}