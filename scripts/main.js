import { createTask, getTasks, renderTasks, totalTasks} from "./tasks.js";
import { filterButtons, state, applyFilterButton, moveFilterButtons } from "./filters.js";

const tasksList = document.querySelector('.list-tasks');
const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');
const addTaskInput = document.querySelector('.add-task input');

//TASKS 
addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents the line break in the textarea 

        createTask();
    }
});

renderTasks();
totalTasks();

window.addEventListener('resize', moveFilterButtons);
document.addEventListener('DOMContentLoaded', moveFilterButtons);

//Filters
if (!state.selectedFilter && tasksList.childElementCount !== 0){
    console.log('ok');
    
    state.selectedFilter = filterButtons[0];
    state.selectedFilter.style.color = 'var(--bright-blue)';
}; 

applyFilterButton();

//DARK THEME
theme.addEventListener('click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark');
});
