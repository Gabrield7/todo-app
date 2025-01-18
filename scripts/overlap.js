import { element, boxPosition, rect, setElementPosition, insideItemArea } from "./drag.js";

//const rect = target => target.getBoundingClientRect();

function overlappingStatus (draggedItem, overlappingItem, xFactor, yFactor) {
    const draggedRect = rect(draggedItem);
    const overlapRect = insideItemArea(overlappingItem, xFactor, yFactor);

    const isXOverlap =
    (draggedRect.right >= overlapRect.left && draggedRect.right <= overlapRect.right) ||
    (draggedRect.left >= overlapRect.left && draggedRect.left <= overlapRect.right);

    const isYOverlap =
    (draggedRect.bottom >= overlapRect.top && draggedRect.bottom <= overlapRect.bottom) ||
    (draggedRect.top >= overlapRect.top && draggedRect.top <= overlapRect.bottom);
    
    if (isXOverlap && isYOverlap) {
        const overlapWidth = Math.abs(Math.min(draggedRect.right, overlapRect.right) - Math.max(draggedRect.left, overlapRect.left));
        const overlapHeight = Math.abs(Math.min(draggedRect.bottom, overlapRect.bottom) - Math.max(draggedRect.top, overlapRect.top));
        
        return overlapWidth * overlapHeight; // Returns the overlapping area
    }

    return 0;// No overlapping
};

let switchThrottle = false;
function switchItens(draggedItem, overlappingItem) {
    if (switchThrottle) return
      
    if (!draggedItem || !overlappingItem || !draggedItem.parentElement || !overlappingItem.parentElement) return; // Validação de elementos  
    
    const draggedItemBox = draggedItem.parentElement;
    const overlappingItemBox = overlappingItem.parentElement;

    if (draggedItemBox === overlappingItemBox) return; // Avoid redundant switches
    
    requestAnimationFrame(() => {
        setElementPosition(overlappingItem, { positionCallback: boxPosition, referenceItem: draggedItemBox });
    });
     // Switches elements in DOM
    draggedItemBox.append(overlappingItem);
    overlappingItemBox.append(draggedItem);
    //Throttle control
    switchThrottle = true;
    setTimeout(() => {
        switchThrottle = false;
    }, 500);
};

let switchBack = false;
function treatOverlapping(boxes){     
    const items = boxes.map(box => box.querySelector('.task'));
    const targetBox = boxes.find(box => box.contains(element.target));
    const targetIndex = items.indexOf(element.target);    

    if (targetIndex === -1) return;

    const targetIndices = {
        after: targetIndex > 0 ? targetIndex - 1 : -1,
        before: targetIndex < items.length - 1 ? targetIndex + 1 : -1,
    }; 

    items.forEach((item, index) => {
        if (!element.target || item === element.target) return;

        const largestOverlapItem = getMaxOverlapItem(element.target, [item, targetBox]);
        const overlapItems = overlappingStatus(element.target, item, 1, 1);

        if(item.hasAttribute('overlapping') && switchBack && item === largestOverlapItem){
            switchItens(element.target, item);
        };

        if (overlapItems && !item.hasAttribute('overlapping') && item === largestOverlapItem){
            item.setAttribute('overlapping', '');
            if(!element.target.hasAttribute('outlist') && (index === targetIndices.after || index === targetIndices.before)){   
                switchItens(element.target, item);
                switchBack = true;
            }

        } else if (!overlapItems && item.hasAttribute('overlapping')) {
            item.removeAttribute('overlapping');
            switchBack = false;
        }
    });
};

function getMaxOverlapItem(element, boxes) {
    let maxArea = 0; // Initialize the maxium area as 'zero'
    let largestOverlaps = []; // Initialize the lergest overlap itens list
    //console.log(boxes);
    
    // Ensures 'box' to be a list, independentemente de ser um único elemento ou uma lista
    boxes.forEach((box) => {
        //console.log(box);
        
        const area = overlappingStatus(element, box, 1, 1); // Get the overlapping area

        if (area > maxArea) { 
            maxArea = area; 
            largestOverlaps = [box]; 
        } else if (area === maxArea) {
            largestOverlaps.push(box);
        }
    });

    // Selects a random element between the lergest overlap area itens
    const randomIndexLargestOverlap = Math.floor(Math.random() * largestOverlaps.length);
    return largestOverlaps[randomIndexLargestOverlap] || null;
};

function findDraggedIndex (target, boxes, overlapItems, targetBox) {
    if (!target) return;

    if (overlapItems.length > 1) {
        const largestOverlap = getMaxOverlapItem(target, overlapItems);
        return boxes.findIndex(box => box.querySelector('.item') === largestOverlap);
    } else if (overlapItems.length === 1) {
        const largestOverlap = getMaxOverlapItem(target, [...overlapItems, targetBox]);
        return largestOverlap === targetBox ? null : boxes.findIndex(box => box.querySelector('.item') === largestOverlap);
    }

    return boxes.findIndex(box => overlappingStatus(element.target, box, 1, 1));
};

const moveItem = (target, items, boxes, startIndex, direction) => {
    boxes.forEach((box, index) => {
        const item = items[index];

        if (item.style.transition) { //In case the animation get interrupted
            const computedStyle = window.getComputedStyle(item);
            const currentLeft = computedStyle.left;
            const currentTop = computedStyle.top;
            item.style.transition = 'none';
            item.style.left = currentLeft;
            item.style.top = currentTop;
            void item.offsetWidth;
            item.style.transition = 'all 0.5s ease-in-out';
        }

        if (index >= startIndex && item && item !== target) {
            requestAnimationFrame(() => {
                setElementPosition(item, { positionCallback: boxPosition, referenceItem: boxes[index + direction] });
            });
            boxes[index + direction]?.append(item);
        }

        if ((direction === 1 && index === startIndex) || 
            (direction === -1 && index === boxes.length - 1)) {
            if (box.childElementCount === 0) box.append(target);
        }
    });
};

function reorderItens(boxes){
    if (!element.target) return;
    
    const isOutList = element.target.hasAttribute('outlist'); //Checks if the target isn't overlapping other elements in the list
    const items = boxes.map(box => box.querySelector('.task'));
    const targetBox = boxes.find(box => box.contains(element.target));
    const targetBoxOverlap = !!overlappingStatus(element.target, targetBox, 1, 1); // chekcs if the target isn't overlapping its own 'box'
    //console.log('items', targetBox);
    //console.log('targetBox', targetBox);
    // overlapItems = items.forEach((item) => {
    //     console.log(item)
    // });

    const overlapAnyBox = boxes.some(box => overlappingStatus(element.target, box, 1, 1));    
    const overlapItems = items.filter(item => item !== element.target && overlappingStatus(element.target, item, 1, 1));

    if(!overlapAnyBox && !isOutList){ //Item se move de 'dentro' da lista para 'fora'
        element.target.setAttribute('outlist','');
        const draggedItemIndex = boxes.findIndex(box => box.contains(element.target));

        moveItem(element.target, items, boxes, draggedItemIndex, -1);
    };
    if (overlapAnyBox && isOutList){ //Item se move de 'fora' da lista para 'dentro'
        element.target.removeAttribute('outlist');
        const draggedItemIndex = findDraggedIndex(element.target, boxes, overlapItems, targetBox);

        if (!draggedItemIndex) return;
        moveItem(element.target, items, boxes, draggedItemIndex, 1);
    };
    if(overlapAnyBox && !isOutList && !targetBoxOverlap){ //Item se move 'dentro' da lista
        element.target.removeAttribute('outlist');
        const initialTargetIndex = boxes.findIndex(box => box.contains(element.target));
        const draggedItemIndex = findDraggedIndex(element.target, boxes, overlapItems, targetBox);

        if(draggedItemIndex !== null && draggedItemIndex !== initialTargetIndex){
            const moveFromIndex = draggedItemIndex > initialTargetIndex ? initialTargetIndex : draggedItemIndex;
            const direction = draggedItemIndex > initialTargetIndex ? -1 : 1;

            moveItem(element.target, items, boxes, moveFromIndex, direction);
        };
    };
    
    boxes.forEach((box, index)=> {
        const item = items[index];
        if (item !== element.target && boxPosition(box) !== boxPosition(item)){
            setElementPosition(item, { positionCallback: boxPosition, referenceItem: box });
        };
    });

};

export { treatOverlapping, reorderItens }