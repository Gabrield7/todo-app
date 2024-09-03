const tasksList = document.querySelector('.list-tasks');

let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;

    const transparentImage = new Image();
    transparentImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/5k4VOwAAAAASUVORK5CYII=';
    event.dataTransfer.setDragImage(transparentImage, 0, 0);

    event.dataTransfer.effectAllowed = "move";
    event.target.style.cursor = 'move';

    tasksList.querySelectorAll('.task').forEach(item => {
        if(item !== draggedItem){
            item.style.opacity = '.3';
        }
    });
}

function dragOver(event) {
    event.preventDefault();

    if (event.target && event.target.classList.contains('task') && event.target !== draggedItem) {
        const allItems = Array.from(tasksList.children);
        const currentIndex = allItems.indexOf(draggedItem);
        const newIndex = allItems.indexOf(event.target);
        
        if (currentIndex < newIndex) {
            tasksList.insertBefore(draggedItem, event.target.nextSibling);
        } else {
            tasksList.insertBefore(draggedItem, event.target);
        }
    }
}

function drop(event) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";
    tasksList.querySelectorAll('.task').forEach(item => {
        item.style.opacity = '1';
    });
}

function initializeDragAndDrop() {
    const taskItems = tasksList.querySelectorAll('.task');

    taskItems.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', drop);
    });
}

export {initializeDragAndDrop}

