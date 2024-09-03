import { createTask, renderTasks, totalTasks} from "./tasks.js";
import { completedFilter, allFilter, activeFilter, clearCompleted, moveFilterButtons } from "./filters.js";

const theme = document.querySelector('.theme-button');
const body = document.querySelector('body');
const addTaskInput = document.querySelector('.add-task input');
//DARK THEME
theme.addEventListener('click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark');
});

//TASKS 
addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Previne a quebra de linha no textarea

        createTask();
    }
});

renderTasks();
totalTasks();

window.addEventListener('resize', moveFilterButtons);
document.addEventListener('DOMContentLoaded', moveFilterButtons);

//Filters
completedFilter();
allFilter();
activeFilter();
clearCompleted();
