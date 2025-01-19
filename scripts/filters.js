import { getTodo, deleteTask } from "./tasks.js";

const tasksList = document.querySelector('.list-tasks');
const filterButtons = document.querySelectorAll('.filter-buttons > button');
const [filterAllBtn, filterActiveBtn, filterCompletedBtn] = filterButtons;
const clearCompletedBtn = document.querySelector('.clear-tasks');

const state = { //Stores in a exportable variable the actual selected filter
    selectedFilter: null,
};

function restoreButtonStyle(btn){
    const originalColor = 'var(--dark-grayish-blue)';

    filterButtons.forEach(button => {
        button.style.color = button === btn? 'var(--bright-blue)' : originalColor;
    });
};

function displayElement(list, filterBtn){
    list.forEach(element => {
        //console.log('display');
        //console.log(element);
        
        const taskElement = element.querySelector('.task');
    
        const isFilterAll = filterBtn=== filterAllBtn;
        const isFilterActive = filterBtn === filterActiveBtn;
        
        if(isFilterAll) {
            element.style.display = 'flex';  
        }else {
            const taskState = taskElement.querySelector('input').checked;       
            element.style.display = (isFilterActive ? taskState : !taskState)? 'none':'flex';
        };
    });
    
};

function applyFilter(filterBtn){
    const todo = getTodo();
    
    filterBtn.addEventListener('click', () => {
        const taskBoxes = tasksList.querySelectorAll('.task-box');
        //taskBoxes.forEach(element => displayElement(element, state.selectedFilter));
        displayElement(taskBoxes, filterBtn);

        restoreButtonStyle(filterBtn);
        state.selectedFilter = filterBtn; // Updates the selected exportable filter variable

        todo.filter = filterBtn.textContent;
        localStorage.setItem('todo', JSON.stringify(todo)); // Updates the selected filter in LocalStorage
    });
};

const applyFilterButton = () => {
    filterButtons.forEach(button => applyFilter(button));

    clearCompletedBtn.addEventListener('click', () => {
        //const taskElements = tasksList.querySelectorAll('.task');
        const taskBoxes = tasksList.querySelectorAll('.task-box');

        taskBoxes.forEach(element => {
            const taskState = element.querySelector('input').checked;
            
            if(taskState) deleteTask(element);
        });
    });
};

function moveFilterButtons() {
    const filterButtonsDiv = document.querySelector('.filter-buttons');
    const filterButtonsMobile = document.querySelector('.filter-buttons__mobile');

    filterButtons.forEach(btn => {
        filterButtonsMobile.style.display = 'none';
        if(filterButtonsMobile.contains(btn)){
            filterButtonsDiv.appendChild(btn);
        };
    });

    if (window.innerWidth < 501) {
        filterButtonsMobile.style.display = 'flex';
        filterButtons.forEach(btn => {
            if(filterButtonsDiv.contains(btn)){
                filterButtonsMobile.appendChild(btn);
            }
        });
    };
};

export {state, filterButtons, applyFilterButton, displayElement, moveFilterButtons};
