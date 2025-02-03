import { switchItem, treatOverlapping, reorderItens } from './overlap.js'
import { getTodo } from './tasks.js';
import { keyboardActive } from './main.js';

const tasksList = document.querySelector('.list-tasks');
const boxes = () => Array.from(document.getElementsByClassName('task-box'));
const allItems = () => boxes().map(box => box.querySelector('.task'));

let element = {
    target: null,
    offsetX: null,
    offsetY: null,
    locked: null //Protective lock to prevent any interactions until the element reaches its original position
};

function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
        return 'mobile';
    } else if (/tablet/.test(userAgent)) {
        return 'tablet';
    } else {
        return 'desktop';
    }
};

const rect = target => target.getBoundingClientRect();

const boxPosition = (box) => {
    return {
        left: box.getAttribute('x'),
        top: box.getAttribute('y')
    };
};

const setElementPosition = (item, { positionCallback, referenceItem, left, top }) => {     
    if(keyboardActive) return;

    const scrollLeft = window.scrollX || 0;
    const scrollTop = window.scrollY || 0;

    if (positionCallback && referenceItem) {
        const { left: calcLeft, top: calcTop } = positionCallback(referenceItem);
        item.style.left = `${calcLeft + scrollLeft}px`;
        item.style.top = `${calcTop + scrollTop}px`;
    } else if (left !== undefined && top !== undefined) {
        item.style.left = `${left + scrollLeft}px`;
        item.style.top = `${top + scrollTop}px`;
    }
};

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

function isInsideItemArea(xPosition, yPosition){
    if (!element.target) return;

    const { left, right, top, bottom } = insideItemArea(element.target, 0.7, 1);

    return (
        xPosition > left &&
        xPosition < right &&
        yPosition > top &&
        yPosition < bottom
    );
};

let scroll = {
    is: false,
    interval: null,
    direction: null,
}
function autoScroll(direction){
    if (scroll.is || !element.target) return;
    scroll.is = true;

    scroll.interval = setInterval(() => {
        if(direction > 0){
            scroll.direction = 1
            if (window.innerHeight >= rect(tasksList).bottom || !element.target) {
                clearInterval(scroll.interval);
                scroll.is = false;
                return;
            };
        } else {
            scroll.direction = -1
            if (window.innerHeight <= rect(tasksList).top || !element.target) {
                clearInterval(scroll.interval);
                scroll.is = false;
                return;
            };
        };

        window.scrollBy(0, direction); // Moves the scroll down progressively
        followCursor(element.target);
    }, 5);
};

const cursorGlobalState = (() => {
    const cursorPosition = {
        x: null,
        y: null,
        lastX: null,
        lastY: null,
        speed: 0,
        lastTime: null,
        mouseDownTime: null,
        mouseDown: false
    };
    // Updates the cursor coordinates globally
    window.addEventListener('mousemove', (e) => {        
        const currentTime = Date.now();

        cursorPosition.lastX = cursorPosition.x;
        cursorPosition.lastY = cursorPosition.y;

        cursorPosition.x = e.clientX; // 'X' position in relation to the viewport
        cursorPosition.y = e.clientY; // 'Y' position in relation to the viewport

        // Speed control
        if (cursorPosition.lastX !== null && cursorPosition.lastY !== null) {
            const distance = Math.sqrt(
                Math.pow(cursorPosition.x - cursorPosition.lastX, 2) +
                Math.pow(cursorPosition.y - cursorPosition.lastY, 2)
            );
            const timeElapsed = currentTime - (cursorPosition.lastTime || currentTime);
            cursorPosition.speed = timeElapsed > 0 ? distance / timeElapsed : 0;
        }
        cursorPosition.lastTime = currentTime;
        
        if(element.target && cursorGlobalState.mouseDown) followCursor(element.target);

        if (cursorPosition.x < 0 || cursorPosition.x > window.innerWidth || cursorPosition.y < 0 || cursorPosition.y > window.innerHeight && element.target) backToPosition(element.target); //Browser window edge control

        //Speed control
        if (cursorPosition.speed > 3) backToPosition(element.target);

        //Auto scroll control
        const delta = { //Cursor displacement in relation to the previous movement
            x: cursorGlobalState.x - cursorGlobalState.lastX || 0,
            y: cursorGlobalState.y - cursorGlobalState.lastY || 0
        };

        if(scroll.is && delta.y < 0 && scroll.direction === 1 || delta.y > 0 && scroll.direction === -1){
            clearInterval(scroll.interval);
            scroll.is = false;
        };
    });
    // Detects when the mouse button (left one) is clicked
    window.addEventListener('mousedown', () => {
        cursorPosition.mouseDown = true;
    });
    // Detects when the mouse button (left one) has been released
    window.addEventListener('mouseup', () => {
        cursorPosition.mouseDown = false;
    });

    if(getDeviceType() !== 'desktop'){
        window.addEventListener('touchmove', (e) => {        
            const touch = e.changedTouches[0];
            
            cursorPosition.lastX = cursorPosition.x;
            cursorPosition.lastY = cursorPosition.y;
    
            cursorPosition.x = touch.clientX; // 'X' position in relation to the viewport
            cursorPosition.y = touch.clientY; // 'Y' position in relation to the viewport
            
            if(element.target && cursorGlobalState.mouseDown) followCursor(element.target);
    
            if (cursorPosition.x < 0 || cursorPosition.x > window.innerWidth || cursorPosition.y < 0 || cursorPosition.y > window.innerHeight && element.target) backToPosition(element.target); //Browser window edge control
            
            //Auto scroll control
            const delta = { //Cursor displacement in relation to the previous movement
                x: cursorGlobalState.x - cursorGlobalState.lastX || 0,
                y: cursorGlobalState.y - cursorGlobalState.lastY || 0
            };

            if(scroll.is && delta.y < 0 && scroll.direction === 1 || delta.y > 0 && scroll.direction === -1){
                clearInterval(scroll.interval);
                scroll.is = false;
            };
        });
        
        window.addEventListener('touchstart', () => {
            cursorPosition.mouseDown = true;
        });
        
        window.addEventListener('touchend', () => {
            cursorPosition.mouseDown = false;
        });

        window.addEventListener('touchcancel', () => {
            cursorPosition.mouseDown = false;
        });
    };

    window.addEventListener('scroll', () => {
        if(element.target) treatOverlapping(boxes());
    });
    
    return cursorPosition;
})();

function followCursor(target) {    
    if(!element.offsetX || !element.offsetY) return;
    
    const targetRect = rect(target);
    const delta = { //Cursor displacement in relation to the previous movement
        x: cursorGlobalState.x - cursorGlobalState.lastX || 0,
        y: cursorGlobalState.y - cursorGlobalState.lastY || 0
    };
    
    let left = rect(element.target).left;
    if(element.locked){
        left = cursorGlobalState.x - element.offsetX;
    };

    let top = cursorGlobalState.y - element.offsetY;
    
    // Checks the RIGHT and LEFT edges
    if (targetRect.right >= window.innerWidth || targetRect.left <= 0) {
        // Right edge
        if (targetRect.right >= window.innerWidth) {
            left = targetRect.right - targetRect.width; // Calculation of 'left' variable for the right edge
            
            if (delta.x <= 0) { // When the cursor moves in the opposite edge, the element must get grabbed back to the cursor
                
                element.offsetX = cursorGlobalState.lastX - targetRect.left;
                left = cursorGlobalState.x - element.offsetX; // Updates the 'X' position to follow the cursor
            };
        };
        // Left edge
        if (targetRect.left <= 0) {
            left = 0; // Calculation of 'left' variable for the right edge
            
            if (delta.x >= 0) { // When the cursor moves in the opposite edge, the element must get grabbed back to the cursor
                element.offsetX = cursorGlobalState.lastX - targetRect.left;
                left = cursorGlobalState.x - element.offsetX; // Updates the 'X' position to follow the cursor
            };
        };
    };

    // Checks the TOP and BOTTOM edges
    if(element.locked){
        if (targetRect.bottom >= window.innerHeight || targetRect.top <= 0) {
            // Bottom edge
            if (targetRect.bottom >= window.innerHeight) {
                top = targetRect.bottom - targetRect.height; // Calculation of 'Top' variable for the right edge
                
                if (delta.y <= 0) { // When the cursor moves in the opposite edge, the element must get grabbed back to the cursor
                    element.offsetY = cursorGlobalState.lastY - targetRect.top;
                    top = cursorGlobalState.y - element.offsetY; // Updates the 'Y' position to follow the cursor
                };
            };
            // Top edge
            if (targetRect.top <= 0) {
                top = 0; // Calculation of 'Top' variable for the right edge
                 
                if (delta.y >= 0) { // When the cursor moves in the opposite edge, the element must get grabbed back to the cursor
                    element.offsetY = cursorGlobalState.lastY - targetRect.top;
                    top = cursorGlobalState.y - element.offsetY; // Updates the 'Y' position to follow the cursor
                };
            };
        }; 
    }else{
        if (targetRect.bottom >= rect(tasksList).bottom || targetRect.top <= rect(tasksList).top) {
            // Bottom edge
            if (targetRect.bottom >= rect(tasksList).bottom) {
                top = rect(element.target).top; // Calculation of 'Top' variable for the right edge
                
                if (delta.y <= 0) { // When the cursor moves in the opposite edge, the element must get grabbed back to the cursor 
                    element.offsetY = cursorGlobalState.lastY - targetRect.top;
                    top = cursorGlobalState.y - element.offsetY; // Updates the 'Y' position to follow the cursor
                };
            };
            // Top edge
            if (targetRect.top <= rect(tasksList).top) {
                top = rect(tasksList).top; // Calculation of 'Top' variable for the right edge
                 
                if (delta.y >= 0) { // When the cursor moves in the opposite edge, the element must get grabbed back to the cursor
                    element.offsetY = cursorGlobalState.lastY - targetRect.top;
                    top = cursorGlobalState.y - element.offsetY; // Updates the 'Y' position to follow the cursor
                };
            };

        };
    };
    setElementPosition(element.target, { left, top });
};

function switchTasksPostion(){   
    const todo = getTodo();

    const targetId = element.target.querySelector('input').id;
    const targetNumber = Number(targetId.split('-')[1]);
    
    const fromIndex = todo.tasks.findIndex(task => task.id === targetNumber);

    const toIndex = allItems().findIndex(item => {
        const itemId = item.querySelector('input').id;
        const itemNumber = Number(itemId.split('-')[1]);
        
        return itemNumber === targetNumber;
    });

    const [movedItem] = todo.tasks.splice(fromIndex, 1);
    
    todo.tasks.splice(toIndex, 0, movedItem);
    
    localStorage.setItem('todo', JSON.stringify(todo));
};

function backToPosition(item) {   
    if(!element.target) return;

    const boxItem = item.parentElement;
    
    if (!item.style.transition){
        item.style.transition = `all 1s ease-in-out`;
    };

    requestAnimationFrame(() => {
        setElementPosition(item, { positionCallback: rect, referenceItem: boxItem });
    });
    //Styles
    allItems().forEach(task => task.style.opacity = 1);
    item.style.zIndex = 0;
    
    setTimeout(() => {
        allItems().forEach(element => {
            if(element.style.transition) element.style.transition = '';
        });

        element.locked = false;
    }, 1000);

    element.target.removeAttribute('outlist');

    switchTasksPostion();
    element.target = null;

    switchItem.back = false;
    clearTimeout(switchItem.timer);
};

function applyCursorEvents(box){
    const item = box.querySelectorAll('.task')[0];

    box.setAttribute('x', rect(box).left);
    box.setAttribute('y', rect(box).top);
    
    requestAnimationFrame(() => { 
        setElementPosition(item, { positionCallback: rect, referenceItem: box });
    });

    const resizeObserver = new ResizeObserver(() => {
        box.style.height = `${item.offsetHeight}px`
    });
    resizeObserver.observe(item);

    item.addEventListener('mousedown', e => {
        e.preventDefault();
        cursorGlobalState.mouseDownTime = setTimeout(() => {
            if (!element.locked){
                const excludedSelectors = ['input', 'label', 'button'];
                if (excludedSelectors.some(selector => e.target.matches(selector))) return;
                
                element.target = e.target.closest('.task'); //Selects the element
                
                allItems().forEach(task => {
                    if (element.target) {
                        if (task !== element.target && !task.style.transition) {
                            task.style.transition = 'all .4s ease-in-out';
                        };
                        task.style.opacity = task === element.target? 1 : 0.5;
                        task.style.zIndex = task === element.target? 1 : 0;
                    } 
                });
                
                if(isInsideItemArea(cursorGlobalState.x, cursorGlobalState.y)){
                    element.offsetX = cursorGlobalState.x - rect(element.target).left;
                    element.offsetY = cursorGlobalState.y - rect(element.target).top;
                };
            };
        }, 200);
    });
    
    item.addEventListener('mousemove', () => {   
        if(!element.target) return;

        if(!isInsideItemArea(cursorGlobalState.x, cursorGlobalState.y) && cursorGlobalState.mouseDown && !element.locked){
            element.offsetY = cursorGlobalState.y - rect(element.target).top;
            element.offsetX = cursorGlobalState.x - rect(element.target).left;
            element.locked = true;
        };

        requestAnimationFrame(() => {
            treatOverlapping(boxes());
            reorderItens(boxes());
        });
    });

    item.addEventListener('mouseup', () => {
        clearTimeout(cursorGlobalState.mouseDownTime);

        allItems().forEach(task => {
            if(task.hasAttribute('overlapping')) task.removeAttribute('overlapping');
        });

        if(element.target === item) backToPosition(item);
    });

    item.addEventListener('mouseleave', () => {    
        clearTimeout(cursorGlobalState.mouseDownTime);
        
        allItems().forEach(task => {
            if(task.hasAttribute('overlapping')) task.removeAttribute('overlapping')
        });         

        if(!cursorGlobalState.mouseDown && element.target === item || cursorGlobalState.mouseDown) backToPosition(item);
    });

    if(getDeviceType() !== 'desktop'){
        item.addEventListener('touchstart', (e) => { 
            const excludedSelectors = ['input', 'label', 'button'];
            if (e.cancelable && !excludedSelectors.some(selector => e.target.matches(selector))) e.preventDefault();

            cursorGlobalState.mouseDownTime = setTimeout(() => {
                if (element.locked) return;

                element.target = e.target.closest('.task'); //Selects the element
                
                allItems().forEach(task => {
                    if (element.target) {
                        if (task !== element.target && !task.style.transition) {
                            task.style.transition = 'all .4s ease-in-out';
                        };
                        task.style.opacity = task === element.target? 1 : 0.5;
                        task.style.zIndex = task === element.target? 1 : 0;
                    }; 
                });
                
                const touch = e.changedTouches[0];
                if (isInsideItemArea(touch.clientX, touch.clientY)) {
                    element.offsetX = touch.clientX - rect(element.target).left;
                    element.offsetY = touch.clientY - rect(element.target).top;
                };
            }, 100);
        });
    
        item.addEventListener('touchmove', (e) => {
            if(!element.target) return;
            
            if(!isInsideItemArea(cursorGlobalState.x, cursorGlobalState.y) && cursorGlobalState.mouseDown && !element.locked){
                const touch = e.changedTouches[0];
                cursorGlobalState.x = touch.clientX;
                cursorGlobalState.y = touch.clientY;
                
                element.offsetY = cursorGlobalState.y - rect(element.target).top;
                element.offsetX = cursorGlobalState.x - rect(element.target).left;

                if(element.offsetY <= 0 || element.offsetY >= item.offsetHeight) backToPosition(element.target);
                
                element.locked = true;
            };

            requestAnimationFrame(() => {
                treatOverlapping(boxes());
                reorderItens(boxes());
            });
        });
    
        item.addEventListener('touchend', () => {
            clearTimeout(cursorGlobalState.mouseDownTime);
    
            allItems().forEach(task => {
                if(task.hasAttribute('overlapping')) task.removeAttribute('overlapping');
            });
    
            if(element.target === item) backToPosition(item);
        });

        item.addEventListener('touchcancel', () => {
            clearTimeout(cursorGlobalState.mouseDownTime);
    
            allItems().forEach(task => {
                if(task.hasAttribute('overlapping')) task.removeAttribute('overlapping');
            });
    
            if(element.target === item) backToPosition(item);
        });
    };

    //Adjust the task element position when the viewport is rezided
    window.addEventListener('resize', () => { 
        if(getDeviceType() !== 'desktop') return;
        
        box.setAttribute('x', rect(box).left);
        box.setAttribute('y', rect(box).top);

        setElementPosition(item, { positionCallback: rect, referenceItem: box });
    });
};

export { element, keyboardActive, cursorGlobalState, autoScroll, backToPosition, insideItemArea, boxPosition, rect, setElementPosition, applyCursorEvents };