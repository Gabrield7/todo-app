import { deleteTask } from "./tasks.js";

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

function displayElement(element, filterBtn){
    const isFilterAll = filterBtn === filterAllBtn;
    const isFilterActive = filterBtn === filterActiveBtn;
    
    if(isFilterAll) {
        element.style.display = 'flex';  
    }else {
        const taskState = element.querySelector('input').checked;
        element.style.display = (isFilterActive ? taskState : !taskState) ? 'none' : 'flex';
    }
};

function applyFilter(filterBtn){
    filterBtn.addEventListener('click', () => {
        const taskElements = tasksList.querySelectorAll('.task');
        
        taskElements.forEach(element => displayElement(element, filterBtn));

        restoreButtonStyle(filterBtn);
        state.selectedFilter = filterBtn; // Updates the selected filter
    });
};


const applyFilterButton = () => {
    filterButtons.forEach(button => applyFilter(button));

    clearCompletedBtn.addEventListener('click', () => {
        const taskElements = tasksList.querySelectorAll('.task');

        taskElements.forEach(element => {
            const taskState = element.querySelector('input').checked;
            
            if(taskState){
                deleteTask(element);
            } 
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
