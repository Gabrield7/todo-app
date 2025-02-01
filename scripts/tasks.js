import { state, filterButtons, displayElement } from './filters.js';
import { applyCursorEvents, rect, boxPosition, setElementPosition } from './drag.js';

const addTaskInput = document.querySelector('.add-task input');
const tasksList = document.querySelector('.list-tasks');
const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');

const boxes = () => Array.from(document.getElementsByClassName('task-box'));

function getTodo(){
    const initialTodo = {
        tasks: [],
        theme: 'light',
        filter: state.selectedFilter || 'All'
    };

    return JSON.parse(localStorage.getItem('todo')) || initialTodo;
}

function updateTaskList(task){
    const todo = getTodo();
    todo.tasks.push(task); //adds the new task to the 'tasks' array
    localStorage.setItem('todo', JSON.stringify(todo)); //updates the task list in the localStorage
    totalTasks();
    return todo.tasks;
}

function createTaskElement(taskID, taskDescription){
    const taskBox = document.createElement('li');
    taskBox.classList.add('task-box');

    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    
    taskElement.innerHTML = `
    <input id='task-${taskID}' type='checkbox'>
    <label for='task-${taskID}' class="custom-checkbox"></label>
    <p class='task-description'>${taskDescription}</p>
    <button type='button' class='task-exclude'></button>`;
    
    taskBox.appendChild(taskElement);
    tasksList.appendChild(taskBox);

    const deleteButton = taskElement.querySelector('.task-exclude');
    deleteEventClick(deleteButton); //adds the 'delete task' event to the 'delete button'

    return {
        element: taskElement,
        box: taskBox
    };
};

function createTask(){
    if(addTaskInput.value.trim() === ''){
        addTaskInput.value = '';
        return;
    }
    const todo = getTodo();
    
    // ID defination
    const taskIdArray = todo.tasks.map(task => task.id);
    
    function generateID(tasks) {
        const reorderIds = tasks.slice().sort((a, b) => a - b);
        
        const id = reorderIds.findIndex((id, index) => id !== index);
        const taskID = id !== -1 ? id : reorderIds.length;
        
        return taskID;
    };
    
    const taskID = generateID(taskIdArray);

    let taskBox = null;
    const task = {
        "id": taskID,
        "description": addTaskInput.value,
        "completed": false
    };
    
    const taskElementCriation = createTaskElement(taskID, task.description);
    taskBox = taskElementCriation.box;
    addTaskInput.value = '';

    //Update the local Storage
    updateTaskList(task); 

    //Check task implementation
    const taskElement = taskElementCriation.element;
    const input = taskElement.querySelector('input');
    taskCheckEvent(input);

    //Shows the task element
    const taskBoxes = tasksList.querySelectorAll('.task-box');
    displayElement(state.selectedFilter);
    
    applyCursorEvents(taskBox);
    //Readjustment of the 'element' position in relation to the 'box' position
    setTimeout(() => {
        boxes().forEach(box => { 
            const item = box.querySelector('.task');
    
            setElementPosition(item, { positionCallback: rect, referenceItem: box });
            console.log('reposicioned'); 
        });
    }, 10)

};

function deleteTask(element){
    element.remove();

    const todo = getTodo();
    const taskID = element.querySelector('input').id;
    const taskNumber = Number(taskID.split('-')[1]);

    const index = todo.tasks.findIndex(task => task.id === taskNumber);
    if(index !== -1) todo.tasks.splice(index, 1);
    
    localStorage.setItem('todo', JSON.stringify(todo));

    if(tasksList.childElementCount === 0){ //Restore the 'filter' button style
        filterButtons.forEach(button => {
            button.style.color = 'var(--dark-grayish-blue)';
        });
    };

    setTimeout(() => {
        boxes().forEach(box => { //Readjustment of the 'element' position in relation to the 'box' position
            const item = box.querySelector('.task');
    
            box.setAttribute('x', rect(box).left);
            box.setAttribute('y', rect(box).top);
            
            setElementPosition(item, { positionCallback: rect, referenceItem: box });
        });
    }, 10)
};

function deleteEventClick(button){
    button.addEventListener('click', (e) => {       
        const li = button.parentElement.parentElement;
        deleteTask(li);
        totalTasks();   
        document.activeElement.blur();
    });
};

async function renderTasks() {
    const todo = getTodo();
    if(todo.tasks.length === 0) return;

    await Promise.all(todo.tasks.map((task) => {
        const taskElement = createTaskElement(task.id, task.description).element; //recreate the tasks when the page is reloaded

        const taskInput = taskElement.querySelector('input');
        taskCheckEvent(taskInput);

        taskInput.checked = task && task.completed? true:false;
        strikeDescription(taskInput);

        if (boxPosition(taskElement.parentElement) !== boxPosition(taskElement)){
            taskElement.parentElement.setAttribute('x', rect(taskElement.parentElement).left);
            taskElement.parentElement.setAttribute('y', rect(taskElement.parentElement).top);

            setElementPosition(taskElement, { positionCallback: boxPosition, referenceItem: taskElement });
        };
    }));

    const taskBoxes = tasksList.querySelectorAll('.task-box');
    displayElement(state.selectedFilter);

    return taskBoxes;
};

function taskCheckEvent(input){
    input.addEventListener('change', () => {
        const todo = getTodo();
        const taskID = Number(input.id.split('-')[1]); //Task number regitered in DOM
        const taskIndex = todo.tasks.findIndex(task => task.id === taskID);

        todo.tasks[taskIndex].completed = input.checked ? true:false;
        
        localStorage.setItem('todo', JSON.stringify(todo));
        strikeDescription(input);
        totalTasks();

        displayElement(state.selectedFilter);
    });
};

function strikeDescription(input){ //Adds an 'strike' effect to content tasks marked as completed 
    const taskDescription = input.parentElement.querySelector('.task-description');

    const originalColor = getTodo().theme === 'dark'? 'var(--very-light-grayish-blue)':'var(--very-dark-grayish-blue)';

    taskDescription.style.textDecoration = input.checked ? 'line-through':'none';
    taskDescription.style.color = input.checked ? 'var(--dark-grayish-blue)':originalColor;
}

function totalTasks(){ //Shows (and update) how many tasks left to complete
    const todo = getTodo();
    
    const taskFilters = document.querySelector('.task-filters span');

    const total = todo.tasks.filter(task => task.completed === false).length;
    taskFilters.textContent = `${total} items left`;
}

export { createTask, renderTasks, deleteTask, totalTasks, getTodo, strikeDescription };
