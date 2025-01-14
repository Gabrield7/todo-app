import { deleteTask } from "./tasks.js";

const tasksList = document.querySelector('.list-tasks');
const filterButtons = document.querySelectorAll('.filter-buttons > button');
const [filterAllBtn, filterActiveBtn, filterCompletedBtn] = filterButtons;
const clearCompletedBtn = document.querySelector('.clear-tasks');

let selectedFilter;
//filterButtons.some(button => button === selectedFilter) 

function restoreButtonStyle(btn){
    // const originalColor = btn.style.color;
    const originalColor = 'var(--dark-grayish-blue)';

    filterButtons.forEach(button => {
        button.style.color = originalColor;
    });

    btn.style.color = 'var(--bright-blue)';
}

function allFilter(){   
    filterAllBtn.addEventListener('click', () => {
        const taskElements = tasksList.querySelectorAll('.task');

        taskElements.forEach(element => element.style.display = 'flex');

        restoreButtonStyle(filterAllBtn);
    });

    selectedFilter = filterAllBtn;
}

function activeFilter(){
    filterActiveBtn.addEventListener('click', () => {
        const taskElements = tasksList.querySelectorAll('.task');

        taskElements.forEach(element => {
            const taskState = element.querySelector('input').checked;
            element.style.display = taskState ? 'none' : 'flex';
        });

        restoreButtonStyle(filterActiveBtn);
    });

    selectedFilter = filterActiveBtn;
}

function completedFilter(){
    filterCompletedBtn.addEventListener('click', () => {    
        const taskElements = tasksList.querySelectorAll('.task');

        taskElements.forEach(element => {
            const taskState = element.querySelector('input').checked;
            element.style.display = !taskState ? 'none' : 'flex';
        });

        restoreButtonStyle(filterCompletedBtn);
    });

    selectedFilter = filterCompletedBtn;
}

function clearCompleted(){
    clearCompletedBtn.addEventListener('click', () => {
        const taskElements = tasksList.querySelectorAll('.task');

        taskElements.forEach(element => {
            const taskState = element.querySelector('input').checked;
            
            if(taskState){
                deleteTask(element);
            } 
        });
    })
}

function moveFilterButtons() {
    const filterButtonsDiv = document.querySelector('.filter-buttons');
    const filterButtonsMobile = document.querySelector('.filter-buttons__mobile');

    filterButtons.forEach(btn => {
        filterButtonsMobile.style.display = 'none';
        if(filterButtonsMobile.contains(btn)){
            filterButtonsDiv.appendChild(btn);
        }
    });

    if (window.innerWidth < 501) {
        filterButtonsMobile.style.display = 'flex';
        filterButtons.forEach(btn => {
            if(filterButtonsDiv.contains(btn)){
                filterButtonsMobile.appendChild(btn);
            }
        });

    }
}

export {completedFilter, allFilter, activeFilter, clearCompleted, moveFilterButtons};
