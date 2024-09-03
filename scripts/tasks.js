import { initializeDragAndDrop } from './dragAndDrop.js'

const addTaskInput = document.querySelector('.add-task input');
const tasksList = document.querySelector('.list-tasks');

function getTasks(){
    return JSON.parse(localStorage.getItem('tasks')) || [];
};

function updateTaskList(task){
    const tasks = getTasks();
    tasks.push(task); //adds the new task to the 'tasks' array
    localStorage.setItem('tasks', JSON.stringify(tasks)); //updates the task list in the localStorage
    totalTasks();
    return tasks;
}

function createTaskElement(taskNumber, taskDescription){
    const taskElement = document.createElement('li');
    taskElement.classList.add('task');
    taskElement.setAttribute('draggable', 'true');
    
    taskElement.innerHTML = `
    <input id='task-${taskNumber}' type='checkbox'>
    <label for='task-${taskNumber}' class='task-description'>${taskDescription}</label>
    <button class='task-exclude'></button>`;

    tasksList.appendChild(taskElement);

    const input = taskElement.querySelector('input');
    taskCheckEvent(input);

    const deleteButton = taskElement.querySelector('.task-exclude');
    deleteEventClick(deleteButton); //adds the 'delete task' event to the 'delete button'

    initializeDragAndDrop();
}

function createTask(){
    const taskNumberArray = getTasks().map(task => task.number) || [];
    const taskNumber = taskNumberArray.length > 0 ? Math.max(...taskNumberArray)+1 : 1; //gets the max task number saved in localStorage
    
    if(addTaskInput.value !== '' && taskNumber){
        const task = {
            "description": addTaskInput.value,
            "number": taskNumber,
            "completed": false
        };
    
        createTaskElement(task.number, task.description);
        addTaskInput.value = '';
    
        updateTaskList(task);
    }
};

function deleteTask(element){
    const tasks = getTasks();
    element.remove();

    const taskId = element.querySelector('input').id;
    const taskNumber = Number(taskId.split('-')[1]);
    
    const filteredTasks = tasks.filter(task => task.number !== taskNumber);
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
}

function deleteEventClick(button){
    button.addEventListener('click', () => {
        const li = button.parentElement;
        deleteTask(li);
        totalTasks();   
    })
};

function renderTasks() {
    const tasks = getTasks();
    tasks.forEach(task => createTaskElement(task.number, task.description)); //recreate the tasks when the page is reloaded

    const taskElements = tasksList.querySelectorAll('.task');
    taskElements.forEach(element => {
        const taskInput = element.querySelector('input');
        const taskNumber = Number(taskInput.id.split('-')[1]);
        const task = tasks.find(task => task.number === taskNumber);
        
        taskInput.checked = task && task.completed ? true:false;
        strikeDescription(taskInput);
    });
}

function taskCheckEvent(input){
    input.addEventListener('change', () => {
        const tasks = getTasks();
        const taskNumber = Number(input.id.split('-')[1]); //task number regitered in DOM
        const taskIndex = tasks.findIndex(task => task.number === taskNumber);
        
        tasks[taskIndex].completed = input.checked ? true:false;
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        strikeDescription(input);
        totalTasks();
    });
};

function strikeDescription(input){
    const taskDescription = input.parentElement.querySelector('.task-description');
    
    if (!taskDescription.dataset.originalColor) {
        const originalColor = window.getComputedStyle(taskDescription).getPropertyValue('color'); //gets the propert 'color' regitered in css file
        taskDescription.dataset.originalColor = originalColor; //save the original color
    }
    
    taskDescription.style.textDecoration = input.checked ? 'line-through':'none';
    taskDescription.style.color = input.checked ? 'var(--dark-grayish-blue)':taskDescription.dataset.originalColor;
}

function totalTasks(){
    const tasks = getTasks();
    const taskFilters = document.querySelector('.task-filters span');

    const total = tasks.filter(task => task.completed === false).length;
    taskFilters.textContent = `${total} items left`;
}

export {createTask, renderTasks, deleteTask, totalTasks, getTasks};
